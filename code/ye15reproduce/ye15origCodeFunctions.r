# ye15origCodeFunctions.r - just functions.

# the original code from Ye et al. (2015) PNAS paper
#  "Equation-free mechanistic ecosystem forecasting using empirical dynamic
#  modeling". Taken from their Supporting Information, this was dataS04.txt,
#  resaved.
# Andrew Edwards. 3rd November 2016.


#### README
# The following code is intended for use with the R programming language. No conversion is necessary.
#
# The remaining dataset files will require conversion to .csv format. This can be done using Excel's "save as .csv" command. The expected datafiles are:
# "Dataset S1.xls" ---> "sockeye_ret_data.csv"
# "Dataset S2.xls" ---> "sockeye_data.csv"
# "Dataset S3.xls" ---> "env_data.csv"

#### LICENSE
# This software is Copyright © 2014 The Regents of the University of California. All Rights Reserved.
# 
# Permission to copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice, this paragraph and the following three paragraphs appear in all copies.
# 
# Permission to make commercial use of this software may be obtained by contacting:
# 
# Technology Transfer Office
# 9500 Gilman Drive, Mail Code 0910
# University of California
# La Jolla, CA 92093-0910
# (858) 534-5815
# invent@ucsd.edu
# 
# This software program and documentation are copyrighted by The Regents of the University of California. The software program and documentation are supplied "as is", without any accompanying services from The Regents. The Regents does not warrant that the operation of the program will be uninterrupted or error-free. The end-user understands that the program was developed for research purposes and is advised not to rely exclusively on the program for any reason.
# 
# IN NO EVENT SHALL THE UNIVERSITY OF CALIFORNIA BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT, SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS, ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF THE UNIVERSITY OF CALIFORNIA HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. THE UNIVERSITY OF CALIFORNIA SPECIFICALLY DISCLAIMS ANY WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. THE SOFTWARE PROVIDED HEREUNDER IS ON AN "AS IS" BASIS, AND THE UNIVERSITY OF CALIFORNIA HAS NO OBLIGATIONS TO PROVIDE MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.

#---- packages used ----
library(rEDM)
library(rjags)
library(reshape2)
library(rgl)
library(ggplot2)
library(gridExtra)
library(xtable)

#---- function definitions ----
normalize <- function(block)
{
    if(NCOL(block) > 1)
    {
        n <- NROW(block)
        means <- sapply(block, mean, na.rm = TRUE)
        sds <- sapply(block, sd, na.rm = TRUE)
        return((block - matrix(rep(means, each = n), nrow = n)) / 
                   matrix(rep(sds, each = n), nrow = n))
    }
    else
        return((block - mean(block, na.rm = TRUE)) / sd(block, na.rm = TRUE))
}

normalize_by_cycle_line <- function(ts)
{
    n <- length(ts)
    means <- rep.int(NA, times = 4)
    sds <- rep.int(NA, times = 4)
    mu <- rep.int(NA, times = n)
    sigma <- rep.int(NA, times = n)
    for(k in 1:4)
    {
        index <- seq(from = k, to = n, by = 4)
        means[k] <- mean(ts[index], na.rm = TRUE)
        sds[k] <- sd(ts[index], na.rm = TRUE)
        mu[index] <- means[k]
        sigma[index] <- sds[k]
    }
    ts <- (ts - mu) / sigma
    df <- data.frame(cbind(ts, mu, sigma))
    return(df)
}

compute_stats <- function(obs, pred)
{
    # computes performance metrics for how well predictions match observations
    # obs = vector of observations
    # pred = vector of prediction
    
    N = sum(is.finite(obs) & is.finite(pred))
    rho = cor(obs, pred, use = "pairwise.complete.obs")
    mae = mean(abs(obs-pred), na.rm = TRUE)
    return(data.frame(N = N, rho = rho, mae = mae))
}

preprocess_data <- function()
{
    preprocess_stock <- function(stock_df)
    {
        n <- NROW(stock_df)
        stock_df$rec45 <- stock_df$rec4 + stock_df$rec5
        stock_df$ret <- stock_df$rec4 + c(NA, stock_df$rec5[1:(n-1)]) # age-4 and age-5 fish (aligned to rec4)
        
        temp <- normalize_by_cycle_line(stock_df$rec45)
        stock_df$rec45_n <- temp$ts
        stock_df$rec45_mu <- temp$mu
        stock_df$rec45_sigma <- temp$sigma
        
        temp <- normalize_by_cycle_line(stock_df$rec4)
        stock_df$rec4_n <- temp$ts
        stock_df$rec4_mu <- temp$mu
        stock_df$rec4_sigma <- temp$sigma
        
        temp <- normalize_by_cycle_line(stock_df$rec5)
        stock_df$rec5_n <- temp$ts
        stock_df$rec5_mu <- temp$mu
        stock_df$rec5_sigma <- temp$sigma
        
        temp <- normalize_by_cycle_line(stock_df$eff)
        stock_df$eff_n <- temp$ts
        stock_df$eff_mu <- temp$mu
        stock_df$eff_sigma <- temp$sigma
        
        return(stock_df)
    }
    
    make_block <- function(stock_df, env_data)
    {
        discharge_names <- c("D_max", "D_apr", "D_may", "D_jun")
        temp_names <- c("ET_apr", "ET_may", "ET_jun", "PT_apr", "PT_may", "PT_jun", "PT_jul")
        pdo_names <- "PDO_win"
        discharge <- normalize(env_data[, discharge_names])
        temperature <- normalize(env_data[, temp_names])
        pdo <- normalize(env_data[, pdo_names])
        
        # line up environmental data
        # lag temperature and river discharge 2 years
        desired_years <- stock_df$yr + 2
        index_in_env_data <- match(desired_years, env_data$year)
        index_in_stock_df <- 1:length(desired_years)
        
        discharge_cols <- data.frame(matrix(NA, nrow = length(desired_years), ncol = NCOL(discharge)))
        discharge_cols[index_in_stock_df,] <- discharge[index_in_env_data, ]
        stock_df[, discharge_names] <- discharge_cols
        
        temp_cols <- data.frame(matrix(NA, nrow = length(desired_years), ncol = NCOL(temperature)))
        temp_cols[index_in_stock_df,] <- temperature[index_in_env_data, ]
        stock_df[, temp_names] <- temp_cols
        
        # lag PDO by 1 year (winter before smolt outmigration)
        desired_years <- stock_df$yr + 1
        index_in_env_data <- match(desired_years, env_data$year)
        pdo_cols <- data.frame(matrix(NA, nrow = length(desired_years), ncol = 1))
        pdo_cols[index_in_stock_df,] <- pdo[index_in_env_data]
        stock_df[, pdo_names] <- pdo_cols
        
        return(stock_df)
    }
    
    data <- read.csv("sockeye_data.csv")
    
    # filter stocks we don't want
    stock_data <- split(data, data$stk)
    stock_data <- lapply(stock_data, preprocess_stock)
    
    # add env data
    env_data <- read.csv("env_data.csv")
    block_data <- lapply(stock_data, function(stock_df) { make_block(stock_df, env_data)})
    
    # save and return
    save(block_data, file = "block_data.Rdata")
    return()
}

compute_nonlinearity_aggregated <- function()
{
    load("block_data.Rdata")
    ret <- lapply(block_data, function(x) {
        temp <- x$ret
        temp <- temp[is.finite(temp)]
        return((temp - mean(temp)) / sd(temp))
    })
    x <- c()
    lib <- matrix(NA, nrow = 9, ncol = 2)
    last <- 0
    for(i in 1:9)
    {
        x <- c(x, ret[[i]])
        lib[i,] <- c(last+1, last + length(ret[[i]]))
        last <- lib[i,2]
    }
    simplex_output <- simplex(x, lib = lib, pred = lib, E = 1:6, exclusion_radius = 0, silent = TRUE)
    E <- simplex_output$E[which.max(simplex_output$rho)]
    smap_output <- s_map(x, lib = lib, pred = lib, E = E, exclusion_radius = 0, silent = TRUE)
    theta <- smap_output$theta[which.max(smap_output$rho)]
    
    save(simplex_output, E, smap_output, theta, file = "results_nonlinear_aggregated.Rdata")
    return()
}

test_nonlinearity_aggregated <- function(num_shuffles = 500)
{
    get_smap_stats <- function(x, lib, E = NULL)
    {
        if(is.null(E))
        {
            # compute E using simplex on recruits time series
            simplex_output <- simplex(x, E = 1:8, silent = TRUE)
            best_rho_E <- simplex_output$E[which.max(simplex_output$rho)]
            best_mae_E <- simplex_output$E[which.min(simplex_output$mae)]
            E <- min(best_rho_E, best_mae_E)
        }
        
        # compute theta using s-map and E 
        smap_output <- s_map(x, lib = lib, pred = lib, E = E, silent = TRUE)
        
        best_rho <- max(smap_output$rho)
        best_mae <- min(smap_output$mae)
        return(data.frame(delta_mae = best_mae - smap_output$mae[smap_output$theta == 0]))
    }
    
    load("block_data.Rdata")
    ret <- lapply(block_data, function(x) {
        temp <- x$ret
        temp <- temp[is.finite(temp)]
        return((temp - mean(temp)) / sd(temp))
    })
    x <- c()
    lib <- matrix(NA, nrow = 9, ncol = 2)
    last <- 0
    for(i in 1:9)
    {
        x <- c(x, ret[[i]])
        lib[i,] <- c(last+1, last + length(ret[[i]]))
        last <- lib[i,2]
    }
    E <- 4
    
    cat("calculating for actual data... ", sep = "")
    start_time <- proc.time()
    actual <- get_smap_stats(x, lib, E)
    delta_mae <- actual$delta_mae
    elapsed_time <- proc.time() - start_time
    cat("(", elapsed_time[3], " sec.)\n", sep = "")
    
    # null distribution
    cat("calculating for random shuffles... ", sep = "")
    start_time <- proc.time()
    null_dist <- do.call(rbind, lapply(1:num_shuffles, function(i) {
        x_shuffle <- c()
        for(i in 1:9)
        {
            n <- length(ret[[i]])
            x_shuffle <- c(x_shuffle, ret[[i]][sample(n, n)])
        }
        return(get_smap_stats(x_shuffle, lib, E))
    }))
    
    delta_mae_p = (sum(null_dist$delta_mae < delta_mae)+1) / num_shuffles
    elapsed_time <- proc.time() - start_time
    cat("(", elapsed_time[3], " sec.)\n", sep = "")
    
    save(delta_mae = delta_mae, delta_mae_p = delta_mae_p, 
         file = "test_nonlinear_aggregated.Rdata")
    return()
}

compute_nonlinearity_stock <- function()
{
    get_smap_stats <- function(x, E = NULL)
    {
        if(is.null(E))
        {
            # compute E using simplex on recruits time series
            simplex_output <- simplex(x, E = 1:8, silent = TRUE)
            best_rho_E <- simplex_output$E[which.max(simplex_output$rho)]
            best_mae_E <- simplex_output$E[which.min(simplex_output$mae)]
            E <- min(best_rho_E, best_mae_E)
        }
        
        # compute theta using s-map and E 
        smap_output <- s_map(x, E = E, silent = TRUE)
        
        best_rho <- max(smap_output$rho)
        best_mae <- min(smap_output$mae)
        return(data.frame(delta_mae = best_mae - smap_output$mae[smap_output$theta == 0]))
    }
    
    nonlinearity_for_stock <- function(stock_df, num_shuffles = 500, max_E = 8)
    {
        x <- stock_df$ret
        x <- x[is.finite(x)]
        n <- length(x)
        
        cat("calculating for actual data for ", as.character(stock_df$stk[1]), "... ", sep = "")
        start_time <- proc.time()
        simplex_output <- simplex(x, E = 1:8, silent = TRUE)
        best_rho_E <- simplex_output$E[which.max(simplex_output$rho)]
        best_mae_E <- simplex_output$E[which.min(simplex_output$mae)]
        E <- min(best_rho_E, best_mae_E)
        
        # compute theta using s-map and E 
        smap_output <- s_map(x, E = E, silent = TRUE)
        
        best_rho <- max(smap_output$rho)
        best_mae <- min(smap_output$mae)
        theta <- smap_output$theta[which.min(smap_output$mae)]
        delta_mae <- best_mae - smap_output$mae[smap_output$theta == 0]
        elapsed_time <- proc.time() - start_time
        cat("(", elapsed_time[3], " sec.)\n", sep = "")
        
        cat("calculating for random shuffles for ", as.character(stock_df$stk[1]), "... ", sep = "")
        start_time <- proc.time()
        null_dist <- do.call(rbind, lapply(1:num_shuffles, function(i) {
            x_shuffle <- x[sample(n, n)]
            return(get_smap_stats(x_shuffle, E))
        }))
        
        delta_mae_p = (sum(null_dist$delta_mae < delta_mae)+1) / num_shuffles
        elapsed_time <- proc.time() - start_time
        cat("(", elapsed_time[3], " sec.)\n", sep = "")
        
        return(list(simplex_output = simplex_output, 
                    smap_output = smap_output, 
                    E = E, 
                    theta = theta, 
                    delta_mae = delta_mae, 
                    delta_mae_p = delta_mae_p))
    }
    
    load("block_data.Rdata")
    nonlinearity_results <- lapply(block_data, nonlinearity_for_stock)
    saveRDS(nonlinearity_results, file = "results_nonlinearity_stock.RDS")
    return()
}

simple_EDM <- function()
{
    forecast <- function(stock_df)
    {  
        make_forecasts <- function(block, mu_4, sigma_4, mu_5, sigma_5)
        {
            rec4 <- block_lnlp_4(block, target_column = 2, columns = 1)
            rec5 <- block_lnlp_4(block, target_column = 3, columns = 1)
            
            rec4 <- rec4*sigma_4 + mu_4
            rec5 <- rec5*sigma_5 + mu_5
            return(rec4 + c(NA, rec5[1:(NROW(block)-1)]))
        }
        
        # set up recruits and spawners
        valid <- is.finite(stock_df$rec45) & is.finite(stock_df$eff)
        returns <- stock_df$ret[valid]
        years <- stock_df$yr[valid]
        spawners <- stock_df$eff_n[valid]
        recruits_4 <- stock_df$rec4_n[valid]
        mu_4 <- stock_df$rec4_mu[valid]
        sigma_4 <- stock_df$rec4_sigma[valid]
        recruits_5 <- stock_df$rec5_n[valid]
        mu_5 <- stock_df$rec5_mu[valid]
        sigma_5 <- stock_df$rec5_sigma[valid]
        
        # make block
        block <- data.frame(years = years, eff = spawners, 
                            rec4 = recruits_4, rec5 = recruits_5)
        
        if(length(returns) < 2) # check for enough data
            return(data.frame(year = NaN, obs = NaN, pred = NaN))
        
        forecasts <- make_forecasts(block, mu_4, sigma_4, mu_5, sigma_5)
        return(data.frame(year = years, obs = returns, pred = forecasts))
    }
    
    load("block_data.Rdata")
    
    # make forecasts for each stock
    results <- lapply(names(block_data), 
                      function(stk_name) {
                          cat("forecasting for ", stk_name, "... ", sep = "")
                          start_time <- proc.time()
                          output <- forecast(block_data[[stk_name]])
                          elapsed_time <- proc.time() - start_time
                          cat("(", elapsed_time[3], " sec.)\n", sep = "")
                          return(output)
                      })
    names(results) <- names(block_data)
    saveRDS(results, file = "results_simple_EDM.RDS")
    
    # compute stats
    stats <- do.call(rbind, lapply(results, function(stock_results) {
        compute_stats(stock_results$obs, stock_results$pred)
    }))
    stats$stk <- names(block_data)
    saveRDS(stats, file = "stats_simple_EDM.RDS")
    return()
}

multivariate_EDM <- function()
{
    forecast <- function(stock_df)
    {
        load("block_data.Rdata")
        env_names <- c("D_max", "D_apr", "D_may", "D_jun", 
                       "ET_apr", "ET_may", "ET_jun", 
                       "PT_apr", "PT_may", "PT_jun", "PT_jul", 
                       "PDO_win")
        
        # set up recruits and spawners
        valid <- is.finite(stock_df$rec45) & is.finite(stock_df$eff)
        years <- stock_df$yr[valid]
        returns <- stock_df$ret[valid]
        spawners <- stock_df$eff_n[valid]
        recruits_4 <- stock_df$rec4_n[valid]
        mu_4 <- stock_df$rec4_mu[valid]
        sigma_4 <- stock_df$rec4_sigma[valid]
        recruits_5 <- stock_df$rec5_n[valid]
        mu_5 <- stock_df$rec5_mu[valid]
        sigma_5 <- stock_df$rec5_sigma[valid]
        env <- normalize(stock_df[,env_names])
        
        # make block
        block <- data.frame(years = years, eff = spawners, 
                            rec4 = recruits_4, rec5 = recruits_5)
        block <- cbind(block, env[valid, ])
        
        if(length(returns) < 2) # check for enough data
            return(data.frame(year = NaN, obs = NaN, pred = NaN))
        
        columns <- list()
        for(E in 1:2)
        {
            columns <- c(columns, combn(env_names, E, simplify = FALSE))
        }
        columns <- lapply(columns, function(embedding) c("eff", embedding))
        columns <- c(columns, "eff")
        rec4_preds <- do.call(cbind, block_lnlp_4(block, target_column = 2, columns = columns))
        rec5_preds <- do.call(cbind, block_lnlp_4(block, target_column = 3, columns = columns))
        rec4_preds <- rec4_preds*sigma_4 + mu_4
        rec5_preds <- rec5_preds*sigma_5 + mu_5
        forecasts <- data.frame(rec4_preds + rbind(NA, rec5_preds[1:NROW(block)-1,]))
        names(forecasts) <- lapply(columns, function(v) paste(v, sep = "", collapse = ", "))
        output <- cbind(year = years, obs = returns, forecasts)
        
        return(output)
    }
    
    load("block_data.Rdata")
    
    # make forecasts for each stock
    results <- lapply(names(block_data), 
                      function(stk_name) {
                          cat("forecasting for ", stk_name, "... ", sep = "")
                          start_time <- proc.time()
                          output <- forecast(block_data[[stk_name]])
                          elapsed_time <- proc.time() - start_time
                          cat("(", elapsed_time[3], " sec.)\n", sep = "")
                          return(output)
                      })
    names(results) <- names(block_data)
    saveRDS(results, file = "results_multivariate_EDM.RDS")
    
    # compute stats
    stats <- lapply(names(block_data), function(stk_name) {
        output <- results[[stk_name]]
        stats <- do.call(rbind, lapply(3:NCOL(output), function(j) {
            compute_stats(output[,2], output[,j])
        }))
        stats$columns <- names(output)[3:NCOL(output)]
        stats$stk <- stk_name
        return(stats)        
    })
    
    stats <- lapply(stats, function(stats_df) {
        stats_df$E <- sapply(strsplit(stats_df$columns, ", "), length)
        with_eff_only <- subset(stats_df, E == 1)
        with_one_env_var <- subset(stats_df, E == 2)
        if(max(with_one_env_var$rho) <= with_eff_only$rho)
            return(subset(stats_df, E <= 2))
        best_env_var <- strsplit(with_one_env_var$columns[which.max(with_one_env_var$rho)], 
                                 ", ")[[1]][2]
        with_two_env_var <- subset(stats_df, E == 3)
        idx <- grep(best_env_var, with_two_env_var$columns)
        return(rbind(with_eff_only, with_one_env_var, with_two_env_var[idx,]))
    })
    
    saveRDS(stats, file = "stats_multivariate_EDM.RDS")
    return()
}


write_model_files <- function()
{
    write(
        "model
{
        for (i in 1:length(recruits))
{
        y[i] <- alpha - beta * spawners[i] + log(spawners[i])
        recruits[i] ~ dlnorm(y[i], tau_r)
}
        
        # priors
        alpha ~ dnorm(0, 1e-6)
        beta ~ dnorm(0, 1e-6)
        tau_r ~ dgamma(0.001, 0.001)
        sigma <- pow(tau_r, -2)
}", file = "ricker_model.txt")

    write(
"model
{
for (i in 1:length(recruits))
{
y[i] <- alpha - beta * spawners[i] + log(spawners[i]) + g * env[i]
recruits[i] ~ dlnorm(y[i], tau_r)
}

# priors
g ~ dnorm(0, 1e-6)
alpha ~ dnorm(0, 1e-6)
beta ~ dnorm(0, 1e-6)
tau_r ~ dgamma(0.001, 0.001)
sigma <- pow(tau_r, -2)
}", file = "ricker_model_env.txt")

    return()
}

standard_ricker <- function()
{
    fit_ricker_to_stock <- function(stock_df)
    {
        # set up recruits and spawners
        valid <- is.finite(stock_df$rec45) & is.finite(stock_df$eff)
        recruits <- stock_df$rec45[valid]
        spawners <- stock_df$eff[valid]
        years <- stock_df$yr[valid]
        returns <- stock_df$ret[valid]
        p4 <- mean(stock_df$rec4 / stock_df$rec45, na.rm = TRUE)
        
        if(length(recruits) < 2) # check for enough data
            return(data.frame(year = NaN, obs = NaN, pred = NaN))
        
        # make ricker model predictions
        ricker_pred <- ricker_ret_model_4(data.frame(years, spawners, recruits), p4 = p4)
        
        return(data.frame(year = years, obs = returns, pred = ricker_pred))
    }
    
    load("block_data.Rdata")
    results_ricker <- lapply(block_data, fit_ricker_to_stock)
    saveRDS(results_ricker, file = "results_standard_ricker.RDS")
    
    stats_ricker <- do.call(rbind, lapply(results_ricker, function(results) {
        compute_stats(results$obs, results$pred)
    }))
    saveRDS(stats_ricker, file = "stats_standard_ricker.RDS")
    return()
}

extended_ricker <- function()
{
    fit_ricker_to_stock <- function(stock_df)
    {
        # set up recruits and spawners
        valid <- is.finite(stock_df$rec45) & is.finite(stock_df$eff)
        recruits <- stock_df$rec45[valid]
        spawners <- stock_df$eff[valid]
        years <- stock_df$yr[valid]
        returns <- stock_df$ret[valid]
        p4 <- mean(stock_df$rec4 / stock_df$rec45, na.rm = TRUE)
        
        if(length(recruits) < 2) # check for enough data
            return(data.frame(year = NaN, obs = NaN, pred = NaN))
        
        # make ricker model predictions
        forecasts <- lapply(env_names, function(env_var) {
            ricker_ret_model_env_4(data.frame(years, spawners, recruits, 
                                              env = stock_df[valid, env_var]), p4 = p4)
        })
        columns <- lapply(env_names, function(env_var) c("eff", env_var))
        forecasts <- data.frame(do.call(cbind, forecasts))
        names(forecasts) <- lapply(columns, function(v) paste(v, sep = "", collapse = ", "))
        
        return(cbind(year = years, obs = returns, forecasts))
    }
    
    env_names <- c("D_max", "D_apr", "D_may", "D_jun", 
                   "ET_apr", "ET_may", "ET_jun", 
                   "PT_apr", "PT_may", "PT_jun", "PT_jul", 
                   "PDO_win")
    
    load("block_data.Rdata")
    results <- lapply(block_data, fit_ricker_to_stock)
    saveRDS(results, file = "results_extended_ricker.RDS")
    
    stats <- lapply(results, function(stock_results) {
        temp <- do.call(rbind, lapply(3:NCOL(stock_results), function(j) {
            compute_stats(stock_results[,2], stock_results[,j])
        }))
        temp$columns <- names(stock_results)[3:NCOL(stock_results)]
        return(temp)
    })
    for(stk_name in names(results))
    {
        stats[[stk_name]]$stk <- stk_name
    }
    
    stats <- do.call(rbind, stats)
    saveRDS(stats, file = "stats_extended_ricker.RDS")
    return()
}

block_lnlp_4 <- function(block, target_column, columns, norm = FALSE)
{
    if(norm)
    {
        block[,columns] <- normalize(block[,columns])
    }
    
    lib_segments <- matrix(NA, nrow = 4, ncol = 2)
    segment_size <- NROW(block)/4
    start_index <- 1
    for(i in 1:4)
    {
        lib_segments[i,1] <- floor(start_index)
        end_index <- start_index - 1 + segment_size
        lib_segments[i,2] <- floor(end_index)
        start_index <- end_index+1
    }
    
    if(is.list(columns))
    {
        preds <- lapply(1:length(columns), function(x) {rep.int(NA, times = NROW(block))})
        for(i in 1:4)
        {
            pred_index <- lib_segments[i,1]:lib_segments[i,2]
            
            temp <- block_lnlp(block, lib = lib_segments[-i,], pred = lib_segments[i,], 
                               target_column = target_column, tp = 0, 
                               first_column_time = TRUE, 
                               columns = columns, stats_only = FALSE)
            
            for(j in 1:length(columns))
                preds[[j]][pred_index] <- temp[[j]]$model_output$pred[pred_index]
        }
    }
    else
    {
        preds <- rep.int(NA, times = NROW(block))
        for(i in 1:4)
        {
            pred_index <- lib_segments[i,1]:lib_segments[i,2]
            
            temp <- block_lnlp(block, lib = lib_segments[-i,], pred = lib_segments[i,], 
                               target_column = target_column, tp = 0, 
                               first_column_time = TRUE, 
                               columns = columns, stats_only = FALSE)
            
            preds[pred_index] <- temp[[1]]$model_output$pred[pred_index]
        }
    }
    return(preds)
}

block_lnlp_4_v <- function(block, target_column, columns)
{
    lib_segments <- matrix(NA, nrow = 4, ncol = 2)
    segment_size <- NROW(block)/4
    start_index <- 1
    for(i in 1:4)
    {
        lib_segments[i,1] <- floor(start_index)
        end_index <- start_index - 1 + segment_size
        lib_segments[i,2] <- floor(end_index)
        start_index <- end_index+1
    }
    
    pred <- rep.int(NA, times = NROW(block))
    pred_var <- rep.int(NA, times = NROW(block))    
    for(i in 1:4)
    {
        pred_index <- lib_segments[i,1]:lib_segments[i,2]
        
        temp <- block_lnlp(block, lib = lib_segments[-i,], pred = lib_segments[i,], 
                           target_column = target_column, tp = 0, 
                           first_column_time = TRUE, 
                           columns = columns, stats_only = FALSE)
        
        pred[pred_index] <- temp[[1]]$model_output$pred[pred_index]
        pred_var[pred_index] <- temp[[1]]$model_output$pred_var[pred_index]
    }
    return(cbind(pred, pred_var))
}

ricker_ret_model_4 <- function(df, p4 = 0.95, num_iter = 30000, num_burnin = 20000, 
                               model_file = "ricker_model.txt")
{
    # setup data
    pred_recruits <- vector("list", NROW(df))
    jags.params <- c("alpha", "beta")
    
    lib_segments <- matrix(NA, nrow = 4, ncol = 2)
    segment_size <- NROW(df)/4
    start_index <- 1
    for(i in 1:4)
    {
        lib_segments[i,1] <- floor(start_index)
        end_index <- start_index - 1 + segment_size
        lib_segments[i,2] <- floor(end_index)
        start_index <- end_index+1
    }
    for(i in 1:4)
    {
        # setup lib and pred
        lib <- lib_segments[-i,]
        pred <- lib_segments[i,]
        lib_index <- do.call(c, lapply(1:NROW(lib), function(x) {lib[x,1]:lib[x,2]}))
        pred_index <- pred[1]:pred[2]
        
        jags.data <- list(recruits = df$recruits[lib_index], spawners = df$spawners[lib_index])
        
        # get estimates for params
        min_S_index <- which(jags.data$spawners == min(jags.data$spawners))
        alpha_hat <- log(jags.data$recruits[min_S_index] / jags.data$spawners[min_S_index])
        max_R_index <- which(jags.data$recruits == max(jags.data$recruits))
        beta_hat <- jags.data$spawners[max_R_index]
        
        # use param estimates to set initial values for chains
        jags.inits <- list(list(alpha = alpha_hat / 2.71828, beta = beta_hat / 2.71828, 
                                .RNG.seed = 1234, .RNG.name = "base::Super-Duper"), 
                           list(alpha = alpha_hat / 2.71828, beta = beta_hat * 2.71828, 
                                .RNG.seed = 1234, .RNG.name = "base::Super-Duper"), 
                           list(alpha = alpha_hat * 2.71828, beta = beta_hat / 2.71828, 
                                .RNG.seed = 1234, .RNG.name = "base::Super-Duper"),
                           list(alpha = alpha_hat * 2.71828, beta = beta_hat * 2.71828, 
                                .RNG.seed = 1234, .RNG.name = "base::Super-Duper"))
        
        # run jags
        my_model <- jags.model(file = model_file, data = jags.data, inits = jags.inits, 
                               n.chains = length(jags.inits))
        update(my_model, n.iter = num_burnin)
        jags_output <- jags.samples(my_model, jags.params, n.iter = num_iter)
        alpha <- as.vector(jags_output[["alpha"]][1,,])
        beta <- as.vector(jags_output[["beta"]][1,,])
        
        # make prediction
        for(k in pred_index)
        {
            pred_recruits[[k]] <- df$spawners[k] * exp(alpha - beta * df$spawners[k])
        }
    }
    
    r_pred <- rep.int(NaN, NROW(df))
    for(k in 2:NROW(df))
    {
        r_pred[k] <- median(pred_recruits[[k]] * p4 + 
                                pred_recruits[[k-1]] * (1-p4))
    }
    return(r_pred)
}

ricker_ret_model_env_4 <- function(df, p4 = 0.95, num_iter = 30000, num_burnin = 20000, 
                                   model_file = "ricker_model_env.txt")
{
    # setup data
    pred_recruits <- vector("list", NROW(df))
    jags.params <- c("alpha", "beta", "g")
    
    lib_segments <- matrix(NA, nrow = 4, ncol = 2)
    segment_size <- NROW(df)/4
    start_index <- 1
    for(i in 1:4)
    {
        lib_segments[i,1] <- floor(start_index)
        end_index <- start_index - 1 + segment_size
        lib_segments[i,2] <- floor(end_index)
        start_index <- end_index+1
    }
    
    for(i in 1:4)
    {
        # setup lib and pred
        lib <- lib_segments[-i,]
        pred <- lib_segments[i,]
        lib_index <- do.call(c, lapply(1:NROW(lib), function(x) {lib[x,1]:lib[x,2]}))
        pred_index <- pred[1]:pred[2]
        
        jags.data <- list(recruits = df$recruits[lib_index], 
                          spawners = df$spawners[lib_index], 
                          env = df$env[lib_index])
        
        # get estimates for params
        min_S_index <- which(jags.data$spawners == min(jags.data$spawners))
        alpha_hat <- log(jags.data$recruits[min_S_index] / jags.data$spawners[min_S_index])
        max_R_index <- which(jags.data$recruits == max(jags.data$recruits))
        beta_hat <- jags.data$spawners[max_R_index]
        
        # use param estimates to set initial values for chains
        jags.inits <- list(list(alpha = alpha_hat / 2.71828, beta = beta_hat / 2.71828, g = 0, 
                                .RNG.seed = 1234, .RNG.name = "base::Super-Duper"), 
                           list(alpha = alpha_hat / 2.71828, beta = beta_hat * 2.71828, g = 0, 
                                .RNG.seed = 1234, .RNG.name = "base::Super-Duper"), 
                           list(alpha = alpha_hat * 2.71828, beta = beta_hat / 2.71828, g = 0, 
                                .RNG.seed = 1234, .RNG.name = "base::Super-Duper"),
                           list(alpha = alpha_hat * 2.71828, beta = beta_hat * 2.71828, g = 0, 
                                .RNG.seed = 1234, .RNG.name = "base::Super-Duper"))
        
        # run jags
        my_model <- jags.model(file = model_file, data = jags.data, inits = jags.inits, 
                               n.chains = length(jags.inits))
        update(my_model, n.iter = num_burnin)
        jags_output <- jags.samples(my_model, jags.params, n.iter = num_iter)
        alpha <- as.vector(jags_output[["alpha"]][1,,])
        beta <- as.vector(jags_output[["beta"]][1,,])
        g <- as.vector(jags_output[["g"]][1,,])
        
        # make prediction
        for(k in pred_index)
        {
            pred_recruits[[k]] <- df$spawners[k] * exp(alpha - 
                                                           beta * df$spawners[k] + 
                                                           g * df$env[k])
        }
    }
    r_pred <- rep.int(NaN, NROW(df))
    for(k in 2:NROW(df))
    {
        r_pred[k] <- median(pred_recruits[[k]] * p4 + 
                                pred_recruits[[k-1]] * (1-p4))
    }
    return(r_pred)
}

compute_ricker_curve <- function(recruits, spawners, num_iter = 30000, num_burnin = 20000)
{
    jags.data <- list(recruits = recruits, spawners = spawners)
    jags.params <- c("alpha", "beta")
    
    # get estimates for params
    min_S_index <- which(jags.data$spawners == min(jags.data$spawners))
    alpha_hat <- log(jags.data$recruits[min_S_index] / jags.data$spawners[min_S_index])
    max_R_index <- which(jags.data$recruits == max(jags.data$recruits))
    beta_hat <- jags.data$spawners[max_R_index]
    
    # use param estimates to set initial values for chains
    jags.inits <- list(list(alpha = alpha_hat / 2.71828, beta = beta_hat / 2.71828, 
                            .RNG.seed = 1234, .RNG.name = "base::Super-Duper"), 
                       list(alpha = alpha_hat / 2.71828, beta = beta_hat * 2.71828, 
                            .RNG.seed = 1234, .RNG.name = "base::Super-Duper"), 
                       list(alpha = alpha_hat * 2.71828, beta = beta_hat / 2.71828, 
                            .RNG.seed = 1234, .RNG.name = "base::Super-Duper"), 
                       list(alpha = alpha_hat * 2.71828, beta = beta_hat * 2.71828, 
                            .RNG.seed = 1234, .RNG.name = "base::Super-Duper"))
    
    # run jags
    my_model <- jags.model(file = "ricker_model.txt", data = jags.data, inits = jags.inits, 
                           n.chains = length(jags.inits))
    update(my_model, n.iter = num_burnin)
    jags_output <- jags.samples(my_model, jags.params, n.iter = num_iter)
    posterior_alpha <- as.vector(jags_output[["alpha"]][1,,])
    posterior_beta <- as.vector(jags_output[["beta"]][1,,])
    
    return(data.frame(alpha = posterior_alpha, beta = posterior_beta))
}

make_ricker_curve_plot <- function(posterior, stock_df, point_size = 4, title = "")
{
    years <- stock_df$yr
    recruits <- stock_df$rec
    spawners <- stock_df$eff
    valid <- is.finite(recruits) & is.finite(spawners)
    years <- years[valid]
    recruits <- recruits[valid]
    spawners <- spawners[valid]
    
    first_half <- 1:floor(NROW(recruits)/2)
    second_half <- (floor(NROW(recruits)/2)+1):NROW(recruits)
    
    pred <- function(x) {sapply(x, function(s) 
        median(s * exp(posterior$params$alpha - posterior$params$beta * s)))}
    pred_1 <- function(x) {sapply(x, function(s) 
        median(s * exp(posterior$first_half_params$alpha - posterior$first_half_params$beta * s)))}
    pred_2 <- function(x) {sapply(x, function(s) 
        median(s * exp(posterior$second_half_params$alpha - posterior$second_half_params$beta * s)))}
    # make plot
    #output_file <- paste("figures/ricker_curve_", stock_df$stk[1], ".pdf", sep = "")
    #pdf(file = output_file, width = 6, height = 6)
    
    label_1 <- paste(years[head(first_half, 1)], " - ", years[tail(first_half, 1)], sep = "")
    label_2 <- paste(years[head(second_half, 1)], " - ", years[tail(second_half, 1)], sep = "")
    label_3 <- paste(years[1], " - ", years[length(years)], sep = "")
    my_labels <- c(label_1, label_2, label_3, label_1, label_2)
    index <- rep.int(NA, times = length(years))
    index[first_half] <- "1"
    index[second_half] <- "2"
    df <- data.frame(year = years, spawners = spawners, recruits = recruits, half = index)
    
    my_plot <- ggplot(data = df, aes(spawners, recruits, color = half, shape = half, linetype = half)) + 
        geom_point(size = point_size) + 
        stat_function(fun = pred_1, aes(color = "1", shape = "1", linetype = "1")) + 
        stat_function(fun = pred_2, aes(color = "2", shape = "2", linetype = "2")) + 
        stat_function(fun = pred, aes(color = "all", shape = "all", linetype = "all")) + 
        scale_color_manual(values = c("royalblue", "red3", "gray"), 
                           labels = c(label_1, label_2, label_3)) + 
        scale_shape_manual(values = c(24, 25, NA), 
                           labels = c(label_1, label_2, label_3)) + 
        scale_linetype_manual(values = c(1, 1, 1), 
                              labels = c(label_1, label_2, label_3)) + 
        # theme_classic() + 
        theme(panel.grid.major = element_blank(),
              panel.grid.minor = element_blank(),
              axis.text = element_text(color = "black"), 
              legend.background = element_rect(color = "black"), 
              legend.key = element_blank(), 
              legend.title = element_blank(), 
              legend.position = c(0, 1), 
              legend.justification = c(0, 1), 
              legend.margin = unit(0.0, "cm"), 
              legend.key.size = unit(1.05, "lines"), 
              legend.key.height = unit(1.05, "lines"), 
              panel.background = element_rect(color = "black", fill = NA)) +
        ggtitle(title) +
        xlab("Spawners (millions of fish)") + 
        ylab("Recruits (millions of fish)")
    
    return(my_plot)
}

extract_results_for_best_models <- function()
{
    simplex_univar_stats <- readRDS("stats_univariate_EDM.RDS")
    simplex_univar_stats$data <- "univariate"
    simplex_univar_stats$columns <- "eff"
    simplex_univar_stats$model <- "EDM"
    simplex_univar_stats$E <- 1
    
    ricker_univar_stats <- readRDS("stats_standard_ricker.RDS")
    ricker_univar_stats$data <- "univariate"
    ricker_univar_stats$columns <- "eff"
    ricker_univar_stats$model <- "Ricker"
    ricker_univar_stats$E <- 1
    ricker_univar_stats$stk <- rownames(ricker_univar_stats)
    
    # load data    
    temp <- readRDS("stats_multivariate_EDM.RDS")
    
    simplex_multivar_stats <- do.call(rbind, temp)
    simplex_multivar_stats$model <- "EDM"
    simplex_multivar_stats$stk <- factor(simplex_multivar_stats$stk)
    
    ricker_multivar_stats <- readRDS("stats_extended_ricker.RDS")
    ricker_multivar_stats$model <- "Ricker"
    ricker_multivar_stats$E <- sapply(strsplit(ricker_multivar_stats$columns, ", "), length)
    
    # get results and save
    ricker_univar_preds <- readRDS("results_standard_ricker.RDS")
    simplex_univar_preds <- readRDS("results_univariate_EDM.RDS")
    ricker_multivar_preds <- readRDS("results_extended_ricker.RDS")
    simplex_multivar_preds <- readRDS("results_multivariate_EDM.RDS")
    
    preds <- list()
    stats <- list()
    for(stk in names(ricker_univar_preds))
    {
        ricker_stats <- ricker_multivar_stats[ricker_multivar_stats$stk == stk,]
        ricker_multivar_model <- ricker_stats$columns[which.max(ricker_stats$rho)]
        ricker_stats$data <- "multivariate"
    
        simplex_stats <- simplex_multivar_stats[simplex_multivar_stats$stk == stk,]
        simplex_multivar_model <- simplex_stats$columns[which.max(simplex_stats$rho)]
        simplex_stats$data <- "multivariate"
                
        preds[[stk]] <- data.frame(year = ricker_univar_preds[[stk]]$year, 
                                   obs = ricker_univar_preds[[stk]]$obs, 
                                   ricker_univar_pred = ricker_univar_preds[[stk]][,"pred"], 
                                   simplex_univar_pred = simplex_univar_preds[[stk]][,"pred"], 
                                   ricker_multivar_pred = ricker_multivar_preds[[stk]][,ricker_multivar_model], 
                                   simplex_multivar_pred = simplex_multivar_preds[[stk]][,simplex_multivar_model])
        stats[[stk]] <- rbind(ricker_univar_stats[ricker_univar_stats$stk == stk,], 
                              simplex_univar_stats[simplex_univar_stats$stk == stk,], 
                              ricker_stats[which.max(ricker_stats$rho),],
                              simplex_stats[which.max(simplex_stats$rho),])
                              
    }
    saveRDS(preds, file = "preds_combined.RDS")
    saveRDS(stats, file = "stats_combined.RDS")
    
    return()
}

rho_comp <- function(x1, x2, y)
    # computes p-value for cor(x1, y) > cor(x2, y) using 
    # t-test with df = length(y) - 2
{
    if(identical(x1, x2))
        return(0.5)
    n <- sum(is.finite(x1) & is.finite(x2) & is.finite(y))
    x1y <- cor(x1, y, use = "pairwise")
    x2y <- cor(x2, y, use = "pairwise")
    err <- TWOpov_err(as.matrix(cbind(x1, x2)), y)
    p_value <- 1 - pt((x1y - x2y) / err, df = n-2, lower.tail = TRUE)
    return(data.frame(df = n-2, statistic = (x1y - x2y) / err, p.value = p_value))
}

# from Wilcox' Robust Statistics R package
TWOpov<-function(x,y,alpha=.05,CN=F)
{
    #
    # Comparing two dependent correlations: Overlapping case
    #
    # x is assumed to be a matrix with 2 columns
    #
    #  Compare correlation of x[,1] with y to x[,2] with y
    #
    if(!is.matrix(x))stop("x should be a matrix")
    if(ncol(x)!=2)stop("x should be a matrix with two columns")
    xy=elimna(cbind(x,y))
    x1=xy[,1]
    x2=xy[,2]
    y=xy[,3]
    r12=cor(x1,y)
    r13=cor(x2,y)
    r23=cor(x1,x2)
    ci12=pcorhc4(x1,y,alpha=alpha,CN=CN)$ci
    ci13=pcorhc4(x2,y,alpha=alpha,CN=CN)$ci
    corhat=((r23-.5*r12*r13)*(1-r12^2-r13^2-r23^2)+r23^3)/((1-r12^2)*(1-r13^2))
    term1=2*corhat*(r12-ci12[1])*(ci13[2]-r13)
    term2=2*corhat*(r12-ci12[2])*(ci13[1]-r13)
    L=r12-r13-sqrt((r12-ci12[1])^2+(ci13[2]-r13)^2-term1)
    U=r12-r13+sqrt((r12-ci12[2])^2+(ci13[1]-r13)^2-term2)
    c(L,U)
}

TWOpov_err <- function(x,y,CN=F)
{
    #
    # Comparing two dependent correlations: Overlapping case
    #
    # x is assumed to be a matrix with 2 columns
    #
    #  Compare correlation of x[,1] with y to x[,2] with y
    #
    # returns p-value
    if(!is.matrix(x))stop("x should be a matrix")
    if(ncol(x)!=2)stop("x should be a matrix with two columns")
    xy=elimna(cbind(x,y))
    x1=xy[,1]
    x2=xy[,2]
    y=xy[,3]
    r12=cor(x1,y)
    r13=cor(x2,y)
    r23=cor(x1,x2)
    err12 <- pcorhc4_err(x1,y,CN=CN)
    err13 <- pcorhc4_err(x2,y,CN=CN)
    corhat=((r23-.5*r12*r13)*(1-r12^2-r13^2-r23^2)+r23^3)/((1-r12^2)*(1-r13^2))
    err_correction_term = 2*corhat*(err12)*(err13)
    err_diff <- sqrt(err12^2 + err13^2 - err_correction_term)
    return(err_diff)
}

# from Wilcox' Robust Statistics R package
elimna<-function(m)
{
    #
    # remove any rows of data having missing values
    #
    if(is.null(dim(m)))m<-as.matrix(m)
    ikeep<-c(1:nrow(m))
    for(i in 1:nrow(m))if(sum(is.na(m[i,])>=1))ikeep[i]<-0
    elimna<-m[ikeep[ikeep>=1],]
    elimna
}

pcorhc4_err <- function(x, y, CN = FALSE)
{
    z1 <- (x - mean(x)) / sd(x)
    z2 <- (y - mean(y)) / sd(y)
    ans <- olshc4(z1, z2, alpha = 0.05, CN = CN)
    return(ans$ci[2, 6])
}

# from Wilcox' Robust Statistics R package
pcorhc4<-function(x,y,alpha=.05,CN=F)
{
    #
    #   Compute a .95 confidence interval for Pearson's correlation coefficient.
    #   using the HC4 method
    #
    # CN=F, degrees of freedom are n-p; seems better for general use.
    # CN=T  degrees of freedom are infinite, as done by Cribari-Neto (2004)
    #
    xy<-elimna(cbind(x,y))
    x<-xy[,1]
    y<-xy[,2]
    z1=(x-mean(x))/sqrt(var(x))
    z2=(y-mean(y))/sqrt(var(y))
    ans=olshc4(z1,z2,alpha=alpha,CN=CN)
    list(r=ans$r,ci=ans$ci[2,3:4],p.value=ans$ci[2,5])
}

# from Wilcox' Robust Statistics R package
olshc4<-function(x,y,alpha=.05,CN=FALSE,xout=FALSE,outfun=outpro,HC3=FALSE,...)
{
    #
    # Compute confidence for least squares
    # regression using heteroscedastic method
    # recommended by Cribari-Neto (2004).
    # CN=F, degrees of freedom are n-p
    # CN=T  degrees of freedom are infinite, as done by Cribari-Neto (2004)
    # All indications are that CN=F is best for general use.
    #
    #  HC3=TRUE, will replace the HC4 estimator with the HC3 estimator.
    #
    x<-as.matrix(x)
    if(nrow(x) != length(y))stop("Length of y does not match number of x values")
    m<-cbind(x,y)
    m<-elimna(m)
    y<-m[,ncol(x)+1]
    x=m[,1:ncol(x)]
    n=length(y)
    nrem=n
    n.keep=length(y)
    x<-as.matrix(x)
    if(xout){
        flag<-outfun(x,...)$keep
        x<-as.matrix(x)
        x<-x[flag,]
        y<-y[flag]
        n.keep=length(y)
        x<-as.matrix(x)
    }
    temp<-lsfit(x,y)
    x<-cbind(rep(1,nrow(x)),x)
    xtx<-solve(t(x)%*%x)
    h<-diag(x%*%xtx%*%t(x))
    n<-length(h)
    d<-(n*h)/sum(h)
    for(i in 1:length(d)){
        d[i]<-min(4, d[i])
    }
    if(HC3)d=2
    hc4<-xtx%*%t(x)%*%diag(temp$res^2/(1-h)^d)%*%x%*%xtx
    df<-nrow(x)-ncol(x)
    crit<-qt(1-alpha/2,df)
    if(CN)crit=qnorm(1-alpha/2)
    al<-ncol(x)
    p=al-1
    ci<-matrix(NA,nrow=al,ncol=6)
    lab.out=rep("Slope",p)
    dimnames(ci)<-list(c("(Intercept)",lab.out),c("Coef.","Estimates",
                                                  "ci.lower","ci.upper","p-value","Std.Error"))
    for(j in 1:al){
        ci[j,1]<-j-1
        ci[j,2]<-temp$coef[j]
        ci[j,3]<-temp$coef[j]-crit*sqrt(hc4[j,j])
        ci[j,4]<-temp$coef[j]+crit*sqrt(hc4[j,j])
        test<-temp$coef[j]/sqrt(hc4[j,j])
        ci[j,5]<-2*(1-pt(abs(test),df))
        if(CN)ci[j,5]<-2*(1-pnorm(abs(test),df))
    }
    ci[,6]=sqrt(diag(hc4))
    list(n=nrem,n.keep=n.keep,ci=ci, cov=hc4)
}

compute_seymour_ricker_params <- function()
{
    compute_ricker_curve_params <- function(stock_df)
    {
        years <- stock_df$yr
        recruits <- stock_df$rec
        spawners <- stock_df$eff
        valid <- is.finite(recruits) & is.finite(spawners)
        years <- years[valid]
        recruits <- recruits[valid]
        spawners <- spawners[valid]
        
        first_half <- 1:floor(NROW(recruits)/2)
        second_half <- (floor(NROW(recruits)/2)+1):NROW(recruits)
        
        # compute params
        first_half_params <- compute_ricker_curve(recruits[first_half], spawners[first_half])
        second_half_params <- compute_ricker_curve(recruits[second_half], spawners[second_half])
        params <- compute_ricker_curve(recruits, spawners)
        
        return(list(first_half_params = first_half_params, 
                    second_half_params = second_half_params, 
                    params = params))
    }
    
    compute_ricker_curve <- function(recruits, spawners, num_iter = 30000, num_burnin = 20000)
    {
        jags.data <- list(recruits = recruits, spawners = spawners)
        jags.params <- c("alpha", "beta")
        
        # get estimates for params
        min_S_index <- which(jags.data$spawners == min(jags.data$spawners))
        alpha_hat <- log(jags.data$recruits[min_S_index] / jags.data$spawners[min_S_index])
        max_R_index <- which(jags.data$recruits == max(jags.data$recruits))
        beta_hat <- jags.data$spawners[max_R_index]
        
        # use param estimates to set initial values for chains
        jags.inits <- list(list(alpha = alpha_hat / 2.71828, beta = beta_hat / 2.71828, 
                                .RNG.seed = 1234, .RNG.name = "base::Super-Duper"), 
                           list(alpha = alpha_hat / 2.71828, beta = beta_hat * 2.71828, 
                                .RNG.seed = 1234, .RNG.name = "base::Super-Duper"), 
                           list(alpha = alpha_hat * 2.71828, beta = beta_hat / 2.71828, 
                                .RNG.seed = 1234, .RNG.name = "base::Super-Duper"), 
                           list(alpha = alpha_hat * 2.71828, beta = beta_hat * 2.71828, 
                                .RNG.seed = 1234, .RNG.name = "base::Super-Duper"))
        
        # run jags
        my_model <- jags.model(file = "ricker_model.txt", data = jags.data, inits = jags.inits, 
                               n.chains = length(jags.inits))
        update(my_model, n.iter = num_burnin)
        jags_output <- jags.samples(my_model, jags.params, n.iter = num_iter)
        posterior_alpha <- as.vector(jags_output[["alpha"]][1,,])
        posterior_beta <- as.vector(jags_output[["beta"]][1,,])
        
        return(data.frame(alpha = posterior_alpha, beta = posterior_beta))
    }

    load("block_data.Rdata")
    
    ricker_posteriors <- compute_ricker_curve_params(block_data[["Seymour"]])
    saveRDS(ricker_posteriors, file = "params_ricker_seymour.RDS")
    return()
}

plot_seymour_ricker_halves <- function()
{    
    load("block_data.Rdata")
    stock_df <- block_data[["Seymour"]]
    
    years <- stock_df$yr
    recruits <- stock_df$rec
    spawners <- stock_df$eff
    valid <- is.finite(recruits) & is.finite(spawners)
    years <- years[valid]
    recruits <- recruits[valid]
    spawners <- spawners[valid]
    
    first_half <- 1:floor(NROW(recruits)/2)
    second_half <- (floor(NROW(recruits)/2)+1):NROW(recruits)
    
    posteriors <- readRDS("params_ricker_seymour.RDS")
    pred <- function(x) {sapply(x, function(s) 
        median(s * exp(posteriors$params$alpha - posteriors$params$beta * s)))}
    pred_1 <- function(x) {sapply(x, function(s) 
        median(s * exp(posteriors$first_half_params$alpha - posteriors$first_half_params$beta * s)))}
    pred_2 <- function(x) {sapply(x, function(s) 
        median(s * exp(posteriors$second_half_params$alpha - posteriors$second_half_params$beta * s)))}
    
    label_1 <- paste(years[head(first_half, 1)], " - ", years[tail(first_half, 1)], sep = "")
    label_2 <- paste(years[head(second_half, 1)], " - ", years[tail(second_half, 1)], sep = "")
    label_3 <- paste(years[1], " - ", years[length(years)], sep = "")
    index <- rep.int(NA, times = length(years))
    index[first_half] <- "1"
    index[second_half] <- "2"
    df <- data.frame(year = years, spawners = spawners, recruits = recruits, half = index)
    
    my_plot <- ggplot(data = df, aes(spawners, recruits, color = half, shape = half, linetype = half)) + 
        geom_point(size = 4) + 
        stat_function(fun = pred_1, aes(color = "1", shape = "1", linetype = "1")) + 
        stat_function(fun = pred_2, aes(color = "2", shape = "2", linetype = "2")) + 
        stat_function(fun = pred, aes(color = "all", shape = "all", linetype = "all")) + 
        scale_color_manual(values = c("royalblue", "red3", "gray"), 
                           labels = c(label_1, label_2, label_3)) + 
        scale_shape_manual(values = c(24, 25, NA), 
                           labels = c(label_1, label_2, label_3)) + 
        scale_linetype_manual(values = c(1, 1, 1), 
                              labels = c(label_1, label_2, label_3)) + 
        # theme_classic() + 
        theme(panel.grid.major = element_blank(),
              panel.grid.minor = element_blank(),
              axis.text = element_text(color = "black"), 
              legend.background = element_rect(color = "black"), 
              legend.key = element_blank(), 
              legend.title = element_blank(), 
              legend.position = c(0, 1), 
              legend.justification = c(0, 1), 
              legend.margin = unit(0.0, "cm"), 
              legend.key.size = unit(1.05, "lines"), 
              legend.key.height = unit(1.05, "lines"), 
              panel.background = element_rect(color = "black", fill = NA)) +
        xlab("Spawners (millions of fish)") + 
        ylab("Recruits (millions of fish)")
    
    print(my_plot)
    return()
}

compute_seymour_ricker_env_params <- function()
{
    fit_ricker_params <- function(df, 
                                  num_iter = 30000, num_burnin = 20000, 
                                  model_file = "ricker_model_env.txt", 
                                  quiet = FALSE)
    {        
        # fit model
        jags.params <- c("alpha", "beta", "g")
        jags.data <- df
        
        # get estimates for params
        min_S_index <- which.min(jags.data$spawners)
        alpha_hat <- log(jags.data$recruits[min_S_index] / jags.data$spawners[min_S_index])
        max_R_index <- which.max(jags.data$recruits)
        beta_hat <- 1/jags.data$spawners[max_R_index]
        
        # use param estimates to set initial values for chains
        jags.inits <- list(list(alpha = alpha_hat / 2.71828, beta = beta_hat / 2.71828, g = 0, 
                                .RNG.seed = 1234, .RNG.name = "base::Super-Duper"), 
                           list(alpha = alpha_hat / 2.71828, beta = beta_hat * 2.71828, g = 0, 
                                .RNG.seed = 1234, .RNG.name = "base::Super-Duper"), 
                           list(alpha = alpha_hat * 2.71828, beta = beta_hat / 2.71828, g = 0, 
                                .RNG.seed = 1234, .RNG.name = "base::Super-Duper"),
                           list(alpha = alpha_hat * 2.71828, beta = beta_hat * 2.71828, g = 0, 
                                .RNG.seed = 1234, .RNG.name = "base::Super-Duper"))
        
        # run jags
        my_model <- jags.model(file = model_file, data = jags.data, inits = jags.inits, 
                               n.chains = length(jags.inits), quiet = quiet)
        update(my_model, n.iter = num_burnin)
        jags_output <- jags.samples(my_model, jags.params, n.iter = num_iter)
        return(data.frame(alpha = as.vector(jags_output[["alpha"]][1,,]), 
                          beta = as.vector(jags_output[["beta"]][1,,]), 
                          g = as.vector(jags_output[["g"]][1,,])))
    }
    
    load("block_data.Rdata")
    
    stk_name <- "Seymour"
    env_var <- "PT_apr"
    
    # setup data
    stock_df <- block_data[[stk_name]]
    valid <- is.finite(stock_df$rec45) & is.finite(stock_df$eff)
    recruits <- stock_df$rec45[valid]
    spawners <- stock_df$eff[valid]
    years <- stock_df$yr[valid]
    env <- stock_df[valid,env_var]
    
    params <- fit_ricker_params(data.frame(recruits, spawners, env))
    saveRDS(params, file = "params_ricker_env_seymour.RDS")
    return()
}

plot_seymour_env_surface <- function(plot_ricker = FALSE)
{
    ricker_func <- function(S, E)
    {
        return(median(S * exp(params$alpha - params$beta * S + params$g * E)))
    }
    
    load("block_data.Rdata")
    
    stk_name <- "Seymour"
    env_var <- "PT_apr"
    
    # setup data
    stock_df <- block_data[[stk_name]]
    valid <- is.finite(stock_df$rec45) & is.finite(stock_df$eff)
    recruits <- stock_df$rec45[valid]
    spawners <- stock_df$eff[valid]
    years <- stock_df$yr[valid]
    returns <- stock_df$ret[valid]
    env <- stock_df[valid, env_var]
    
    params <- readRDS("params_ricker_env_seymour.RDS")
    
    # make predictions for surface plots
    grid_size <- 16
    x <- seq(from = min(spawners), to = max(spawners), length.out = grid_size)
    y <- seq(from = min(env), to = max(env), length.out = grid_size)
    x_mat <- matrix(rep.int(x, times = grid_size), nrow = grid_size)
    y_mat <- matrix(rep.int(y, times = grid_size), nrow = grid_size, byrow = TRUE)
    
    # plot
    plot3d(spawners, env, recruits, size = 5, 
           xlab = "", ylab = "", zlab = "", axes = FALSE)
    axes3d(edges=c("x+-", "y--", "z++"))
    box3d()
    sapply(1:length(recruits), function(i) {rgl.lines(rep(spawners[i], 2), 
                                                      rep(env[i], 2), 
                                                      c(min(recruits), recruits[i]), 
                                                      color = "gray", size = 1)
    })
    if(plot_ricker)
    {
        z_ricker <- mapply(ricker_func, x_mat, y_mat)
        surface3d(x, y, z_ricker, 
                  front = "lines", back = "lines", 
                  alpha = 1, shininess = 100, lit = FALSE, 
                  color = "gray20")
    }
    else
    {
        spawners_n <- (spawners - mean(spawners)) / sd(spawners)
        env_n <- (env - mean(env)) / sd(env)
        x_n <- (x - mean(spawners)) / sd(spawners)
        y_n <- (y - mean(env)) / sd(env)
        block <- rbind(data.frame(recruits = recruits, 
                                  spawners = spawners_n, 
                                  env = env_n), 
                       data.frame(recruits = 1, 
                                  spawners = rep(x_n, each = grid_size), 
                                  env = rep(y_n, grid_size)))
        
        out <- block_lnlp(block, lib = c(1, length(recruits)), 
                          pred = c(length(recruits)+1, NROW(block)), 
                          tp = 0, columns = c(2, 3), stats_only = FALSE)
        z_simplex <- out[[1]]$model_output[(length(recruits)+1):NROW(block), "pred"]
        z_simplex <- matrix(z_simplex, nrow = grid_size, byrow = TRUE)
        surface3d(x, y, z_simplex, 
                  front = "lines", back = "lines", 
                  alpha = 1, shininess = 100, lit = FALSE, 
                  color = "gray20")
    }
    p <- matrix(c(-0.8, -0.6, 0, 0, 
                  0.2, -0.3, 0.9, 0, 
                  -0.6, 0.7, 0.3, 0, 
                  0, 0, 0, 1), nrow = 4, byrow = TRUE)
    par3d(userMatrix = p)
    return()
}

plot_total_returns <- function()
{
    df <- read.csv("sockeye_ret_data.csv")
    df$cycle <- factor(df$yr %% 4)
    
    my_plot <- ggplot(data = df, aes(yr, ret, fill = cycle)) + 
        geom_bar(stat = "identity", color = "black") + 
        scale_fill_manual(values = c("white", "white", "black", "white")) + 
        scale_x_continuous(breaks = seq(1950, 2010, by = 10)) + 
        theme(panel.grid.major = element_blank(),
              panel.grid.minor = element_blank(),
              legend.position = "none", 
              axis.text = element_text(color = "black"), 
              panel.background = element_rect(color = "black", fill = NA)) + 
        xlab("Year") + ylab("Returns (millions of fish)")
    
    return()
}

plot_rho_comparison <- function()
{
    stats <- readRDS("stats_combined.RDS")
    stats <- do.call(rbind, stats)
    rhos <- t(acast(stats, stk ~ model * data, value.var = "rho"))
    rhos <- rhos[c(4, 3, 2, 1),]
    
    par(lwd = 2, mar = c(8, 4, 1, 10), xpd = TRUE)
    barplot(rhos, beside = TRUE, density = c(20, -1), space = c(0, 0.5), 
            col = c("dodgerblue", "dodgerblue", "orange1", "orange1"), 
            las = 2, xlab = "", 
            ylab = expression("Forecast Accuracy (" ~ rho ~ ")"))
    legend(42, 0.5, c("Ricker", "extended Ricker", "simple EDM", "multivariate EDM"), 
           density = c(20, -1), cex = 1.2, 
           fill = c("dodgerblue", "dodgerblue", "orange1", "orange1"), 
           col = c("dodgerblue", "dodgerblue", "orange1", "orange1"))
    
    return()
}

plot_nonlinearity <- function()
{
    load("results_nonlinear_aggregated.Rdata")
    
    par(mfrow = c(1, 2), mar = c(3, 3, 0.5, 0.5), oma = c(0, 0, 0, 0), mgp = c(2, 1, 0))
    max_rho <- max(simplex_output$rho, na.rm = TRUE)
    min_rho <- min(simplex_output$rho, na.rm = TRUE)
    y_limits <- c(max(0, 1.1*min_rho - 0.1*max_rho), min(1.0, 1.1*max_rho - 0.1*min_rho))
    plot(simplex_output$E, pmax(0, simplex_output$rho), type = "l", 
         lwd = 1.5, ylim = y_limits, 
         xlab = "E", ylab = expression(rho))
    max_rho <- max(smap_output$rho, na.rm = TRUE)
    min_rho <- min(smap_output$rho, na.rm = TRUE)
    y_limits <- c(max(0, 1.1*min_rho - 0.1*max_rho), min(1.0, 1.1*max_rho - 0.1*min_rho))
    plot(smap_output$theta, 1 - smap_output$mae, type = "l", 
         lwd = 1.5, xlim = c(0, 4),  ylim = c(0.44, 0.49), 
         xlab = expression(theta), ylab = "1 - MAE")
    text(max(smap_output$theta), y_limits[2], 
         paste("E = ", E, sep = ""), adj = c(1, 1))
    return()
}

plot_mae_comparison <- function()
{
    stats <- readRDS("stats_combined.RDS")
    stats <- do.call(rbind, stats)
    maes <- t(acast(stats, stk ~ model * data, value.var = "mae"))
    maes <- maes[c(4, 3, 2, 1),]
    
    par(lwd = 2, mar = c(8, 4, 1, 10), xpd = TRUE)
    barplot(maes, beside = TRUE, density = c(20, -1), space = c(0, 0.5), 
            col = c("dodgerblue", "dodgerblue", "orange1", "orange1"), 
            las = 2, xlab = "", 
            ylab = "Forecast Error (MAE)")
    legend(42, 0.5, c("Ricker", "extended Ricker", "simple EDM", "multivariate EDM"), 
           density = c(20, -1), cex = 1.2, 
           fill = c("dodgerblue", "dodgerblue", "orange1", "orange1"), 
           col = c("dodgerblue", "dodgerblue", "orange1", "orange1"))
    
    return()
    return()
}

compute_chilko_smolt_forecasts <- function()
{
    cat("forecast with smolts for Chilko... ")
    start_time <- proc.time()
    
    load("block_data.Rdata")
    env_names <- c("D_max", "D_apr", "D_may", "D_jun", 
                   "ET_apr", "ET_may", "ET_jun", 
                   "PT_apr", "PT_may", "PT_jun", "PT_jul", 
                   "PDO_win")
    
    stock_df <- block_data[["Chilko"]]
    
    temp <- normalize_by_cycle_line(stock_df$juv)
    stock_df$juv_n <- temp$ts
    
    # set up recruits and spawners
    valid <- is.finite(stock_df$rec45) & is.finite(stock_df$eff)
    years <- stock_df$yr[valid]
    returns <- stock_df$ret[valid]
    spawners <- stock_df$eff_n[valid]
    smolts <- stock_df$juv_n[valid]
    recruits_4 <- stock_df$rec4_n[valid]
    mu_4 <- stock_df$rec4_mu[valid]
    sigma_4 <- stock_df$rec4_sigma[valid]
    recruits_5 <- stock_df$rec5_n[valid]
    mu_5 <- stock_df$rec5_mu[valid]
    sigma_5 <- stock_df$rec5_sigma[valid]
    env <- normalize(stock_df[,env_names])
    
    # make block
    block <- data.frame(years = years, eff = spawners, juv = smolts, 
                        rec4 = recruits_4, rec5 = recruits_5)
    block <- cbind(block, env[valid, ])
    
    if(length(returns) < 2) # check for enough data
        return(data.frame(year = NaN, obs = NaN, pred = NaN))
    
    columns <- list()
    for(E in 1:2)
    {
        columns <- c(columns, combn(env_names, E, simplify = FALSE))
    }
    columns <- lapply(columns, function(embedding) c("eff", "juv", embedding))
    columns[[length(columns)+1]] <- c("eff", "juv")
    rec4_preds <- do.call(cbind, block_lnlp_4(block, target_column = 3, columns = columns))
    rec5_preds <- do.call(cbind, block_lnlp_4(block, target_column = 4, columns = columns))
    rec4_preds <- rec4_preds*sigma_4 + mu_4
    rec5_preds <- rec5_preds*sigma_5 + mu_5
    forecasts <- data.frame(rec4_preds + rbind(NA, rec5_preds[1:(NROW(block)-1),]))
    names(forecasts) <- lapply(columns, function(v) paste(v, sep = "", collapse = ", "))
    output <- cbind(year = years, obs = returns, forecasts)
    saveRDS(output, file = "results_chilko_smolts.RDS")
    
    stats <- do.call(rbind, lapply(3:NCOL(output), function(j) {
        compute_stats(output[,2], output[,j])
    }))
    stats$columns <- names(output)[3:NCOL(output)]
    saveRDS(stats, file = "stats_chilko_smolts.RDS")
    
    elapsed_time <- proc.time() - start_time
    cat("(", elapsed_time[3], " sec.)\n", sep = "")
    return()
}

plot_chilko_smolt_model <- function()
{
    univar_stats <- readRDS("stats_univariate_EDM.RDS")
    univar_stats <- univar_stats[univar_stats$stk == "Chilko",]
    univar_stats$columns <- "eff"
    univar_stats$E <- 0
    univar_stats$data <- "spawners"
    
    multivar_stats <- do.call(rbind, readRDS("stats_multivariate_EDM.RDS"))
    multivar_stats <- multivar_stats[multivar_stats$stk == "Chilko",]
    multivar_stats$E <- sapply(strsplit(multivar_stats$columns, ", "), length) - 1
    multivar_stats <- multivar_stats[which.max(multivar_stats$rho),]
    multivar_stats$data <- "+ environment"
    
    new_stats <- readRDS("stats_chilko_smolts.RDS")
    new_stats$data <- "+ environment \n& smolts"
    new_stats$E <- sapply(strsplit(new_stats$columns, ", "), length) - 1
    new_stats <- new_stats[which.max(new_stats$rho),]
    new_stats$stk <- "Chilko"
    
    stats <- rbind(univar_stats, multivar_stats, new_stats)
    
    stats <- within(stats, data <- factor(data, levels = c("spawners", "+ environment", 
                                                           "+ environment \n& smolts")))
    
    rho_plot <- ggplot(data = stats, aes(data, rho)) + 
        geom_bar(stat = "identity", position = "dodge", width = 1, show_guide = FALSE) +
        ylab("Forecast Accuracy (rho)") + coord_cartesian(ylim = c(0, 0.5))
    mae_plot <- ggplot(data = stats, aes(data, mae)) + 
        geom_bar(stat = "identity", position = "dodge", width = 1, show_guide = FALSE) +
        ylab("Forecast Error (MAE)") + coord_cartesian(ylim = c(0.5, 0.9))
    
    plots <- lapply(list(rho_plot, mae_plot), function(my_plot) {
        return(my_plot + geom_bar(stat = "identity", position = "dodge", color = "black", fill = "orange1", width = 1, show_guide = FALSE) + 
                   xlab("Data Usage") + 
                   theme(panel.grid.major = element_blank(),
                         panel.grid.minor = element_blank(),
                         axis.text = element_text(color = "black"), 
                         axis.text.x = element_text(angle = 90, hjust = 0.5), 
                         legend.background = element_rect(color = "black"), 
                         legend.key = element_blank(), 
                         legend.title = element_blank(), 
                         legend.position = c(0, 1), 
                         legend.justification = c(0, 1), 
                         legend.margin = unit(0.0, "cm"), 
                         legend.key.size = unit(1.05, "lines"), 
                         legend.key.height = unit(1.05, "lines"), 
                         panel.background = element_rect(color = "black", fill = NA)))
    })
    
    plots[["nrow"]] <- 1
    
    do.call(grid.arrange, plots)
    return()
}

plot_late_shuswap_CI <- function(file = NULL, width = 6, height = 4.5)
{
    stk_name <- "Late Shuswap"
    columns <- c("eff", "D_may", "PT_jul")
    
    load("block_data.Rdata")
    env_names <- c("D_max", "D_apr", "D_may", "D_jun", 
                   "ET_apr", "ET_may", "ET_jun", 
                   "PT_apr", "PT_may", "PT_jun", "PT_jul", 
                   "PDO_win")
    
    stock_df <- block_data[[stk_name]]
    
    # set up recruits and spawners
    valid <- is.finite(stock_df$rec45) & is.finite(stock_df$eff)
    years <- stock_df$yr[valid]
    returns <- stock_df$ret[valid]
    spawners <- stock_df$eff_n[valid]
    recruits_4 <- stock_df$rec4_n[valid]
    mu_4 <- stock_df$rec4_mu[valid]
    sigma_4 <- stock_df$rec4_sigma[valid]
    recruits_5 <- stock_df$rec5_n[valid]
    mu_5 <- stock_df$rec5_mu[valid]
    sigma_5 <- stock_df$rec5_sigma[valid]
    env <- normalize(stock_df[,env_names])
    
    # make block
    block <- data.frame(years = years, eff = spawners, 
                        rec4 = recruits_4, rec5 = recruits_5)
    block <- cbind(block, env[valid, ])
    
    rec4_preds <- data.frame(block_lnlp_4_v(block, target_column = 2, columns = columns))
    rec5_preds <- data.frame(block_lnlp_4_v(block, target_column = 3, columns = columns))
    rec4_preds$pred <- rec4_preds$pred*sigma_4 + mu_4
    rec5_preds$pred <- rec5_preds$pred*sigma_5 + mu_5
    rec4_preds$pred_var <- rec4_preds$pred_var * sigma_4 * sigma_4
    rec5_preds$pred_var <- rec5_preds$pred_var * sigma_5 * sigma_5
    
    rets <- data.frame(pred = rec4_preds$pred + c(NA, rec5_preds$pred[1:NROW(block)-1]), 
                       pred_var = rec4_preds$pred_var + c(NA, rec5_preds$pred_var[1:NROW(block)-1]))
    rets$pred_std_err <- sqrt(rets$pred_var)
    
    if(!is.null(file))
    {
        pdf(file = file, width = width, height = height)
    }
    par(mar = c(4,4,1,1), mgp = c(2.5,1,0))
    years <- years + 4
    plot(years, returns, type = "l", 
         #         ylim = c(0, 18), 
         xlab = "Year", ylab = "Returns (millions of fish)")
    points(years, rets$pred, col = "blue", pch = 1)
    for(i in seq_along(returns))
    {
        lines(c(years[i],years[i]), rets$pred[i] + c(rets$pred_std_err[i], -rets$pred_std_err[i]), 
              col = "blue")
    }
    legend(x = "topright", legend = c("Observed", "Predicted (+/- 1 SE)"), 
           col = c("black", "blue"), lwd = c(1,NA), pch = c(NA, 1), inset = 0.02)
    if(!is.null(file))
    {
        dev.off()
    }
    
    return()
}

print_env_comparison_table <- function()
{
    stats <- readRDS("stats_combined.RDS")
    stats <- do.call(rbind, stats)
    stats <- subset(stats, data == "multivariate")
    stats_table <- data.frame(stock = stats$stk, model = stats$model, predictors = stats$columns, 
                   "num. predictions" = stats$N, rho = stats$rho, MAE = stats$mae)

    my_table <- xtable(stats_table, digits = 3)
    print(my_table, type = "html", file = "tables/Table_1.html")

    return()
}

print_nonlinearity_table <- function()
{
    nonlinear_results <- readRDS("results_nonlinearity_stock.RDS")
    temp_table <- do.call(rbind, lapply(nonlinear_results, function(res) {
        return(data.frame(E = res$E, theta = res$theta, 
                          delta_mae = res$delta_mae, p_value = res$delta_mae_p))
    }))
    temp_table$stock <- rownames(temp_table)
    temp_table <- temp_table[order(temp_table$stock), 
                             c("stock", "E", "theta", "delta_mae", "p_value")]
    temp_table$"significantly nonlinear?" <- temp_table$p_value <= 0.05
    
    my_table <- xtable(temp_table, digits = 3)
    print(my_table, type = "html", file = "tables/Table_S1.html", include.rownames = FALSE)
    
    return()    
}

print_comparison_table <- function()
{
    compute_p_values <- function(x1, x2, y)
    {
        index <- is.finite(x1) & is.finite(x2) & is.finite(y)
        x1 <- x1[index]
        x2 <- x2[index]
        y <- y[index]
        err1 <- abs(y - x1)
        err2 <- abs(y - x2)
        mae_ttest <- t.test(err1, err2, paired = TRUE, alternative = "less")
        mae_df <- mae_ttest$parameter
        mae_statistic <- mae_ttest$statistic
        mae_p <- mae_ttest$p.value
        rho_ttest <- rho_comp(x1, x2, y)
        rho_df <- rho_ttest$df
        rho_statistic <- rho_ttest$statistic
        rho_p <- rho_ttest$p.value
        return(data.frame(mae_df, mae_statistic, mae_p, rho_df, rho_statistic, rho_p))
    }
    
    preds <- readRDS("preds_combined.RDS")
    
    # normalize by mean obs value
    preds_n <- lapply(names(preds), function(stk_name) {
        df <- preds[[stk_name]]
        sigma <- sd(df$obs, na.rm = TRUE)
        mu <- mean(df$obs, na.rm = TRUE)
        df$obs <- (df$obs - sigma) / mu
        df$simplex_univar_pred <- (df$simplex_univar_pred - sigma) / mu
        df$ricker_univar_pred <- (df$ricker_univar_pred - sigma) / mu
        df$simplex_multivar_pred <- (df$simplex_multivar_pred - sigma) / mu
        df$ricker_multivar_pred <- (df$ricker_multivar_pred - sigma) / mu
        df$stk <- stk_name
        return(df)
    })
    preds_n <- do.call(rbind, preds_n)
    preds_n$stk <- factor(preds_n$stk)
    
    compare_from <- list(preds_n$simplex_univar_pred, 
                         preds_n$simplex_multivar_pred, 
                         preds_n$ricker_multivar_pred, 
                         preds_n$simplex_multivar_pred)
    compare_to <- list(preds_n$ricker_univar_pred, 
                       preds_n$ricker_multivar_pred, 
                       preds_n$ricker_univar_pred, 
                       preds_n$simplex_univar_pred)
    comparison_names <- list("simple EDM vs. Ricker", 
                             "multivariate EDM vs. extended Ricker", 
                             "extended Ricker vs. Ricker", 
                             "multivariate EDM vs. simple EDM")
    
    temp_table <- do.call(rbind, lapply(1:4, function(i) {
        temp <- compute_p_values(compare_from[[i]], compare_to[[i]], preds_n$obs)
        return(data.frame(comparison = comparison_names[[i]], 
                   performance_measure = c("rho", "MAE"), 
                   test_type = "t",
                   test_statistic = c(temp$rho_statistic, temp$mae_statistic), 
                   df = c(temp$rho_df, temp$mae_df), 
                   p_value = c(temp$rho_p, temp$mae_p)))
    }))
    my_table <- xtable(temp_table, digits = 3)
    print(my_table, type = "html", file = "tables/Table_S2.html", include.rownames = FALSE)
    
    return()
}

compute_ccm <- function()
{
    load("block_data.Rdata")
    env_names <- c("D_max", "D_apr", "D_may", "D_jun", 
                   "ET_apr", "ET_may", "ET_jun", 
                   "PT_apr", "PT_may", "PT_jun", "PT_jul", 
                   "PDO_win")
    
    ccm_table <- do.call(rbind, lapply(block_data, function(stock_df) {
        valid <- is.finite(stock_df$rec45) & is.finite(stock_df$eff)
        block <- stock_df[valid,]
        
        ccm_rhos <- do.call(cbind, lapply(env_names, function(env_var) {
            output <- block_lnlp(block, tp = 0, target_column = env_var, 
                                 columns = c("rec45_n", "eff_n"), silent = TRUE)
            return(output$rho)
        }))
        colnames(ccm_rhos) <- env_names
        ccm_rhos <- cbind(N = sum(valid), ccm_rhos)
        return(ccm_rhos)
    }))
    rownames(ccm_table) <- names(block_data)
    saveRDS(ccm_table, file = "results_ccm.RDS")
    return()
}

print_ccm_table <- function()
{
    ccm_table <- data.frame(readRDS("results_ccm.RDS"))
    ccm_table <- cbind("N" = ccm_table$N,
                       "95% p" = tanh(qnorm(0.95, sd = 1/sqrt(ccm_table$N - 3))), 
                       ccm_table[,2:NCOL(ccm_table)])
    my_table <- xtable(ccm_table, digits = 3)
    print(my_table, type = "html", file = "tables/Table_S3.html")
    return()
}

print_EDM_env_models <- function()
{
    stats <- readRDS("stats_multivariate_EDM.RDS")
    temp_table <- do.call(rbind, stats)
    temp_table <- data.frame(stock = temp_table$stk, 
                             predictors = temp_table$columns, 
                             num_predictions = temp_table$N, 
                             rho = temp_table$rho, 
                             MAE = temp_table$mae)
    my_table <- xtable(temp_table, digits = 3)
    print(my_table, type = "html", file = "tables/Table_S4.html", include.rownames = FALSE)
    
    return()
}