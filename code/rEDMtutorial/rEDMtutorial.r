# rEDMtutorial.r. Trying to understand EDM. Using code from the vignette
#  at https://cran.r-project.org/web/packages/rEDM/vignettes/rEDM_tutorial.html
#  I will just write this as R code to be run one line at a time to help
#  understanding. It looks like the vignette does not directly reproduce
#  the Sugihara and May (1990, Nature 344:734) results, but can maybe be
#  adapted to do so.
#  Andrew Edwards. 4th November 2016

rm(list=ls())
require(rEDM)
data(tentmap_del)

ts = tentmap_del            # ts is the time series of data (not same as
                            #  Sugihara & May 1990 since range is different)
lib = c(1, 100)             # the library to construct the model
pred = c(201, 500)          # the prediction set to test the model

simplex_output <- simplex(ts, lib, pred)
?simplex

plot(simplex_output$E, simplex_output$rho, type = "l",
    xlab = "Embedding Dimension (E)", 
    ylab = "Forecast Skill (rho)")
# So E=2 is the optimal embedding dimension

# ts does not seem to be same as in Sugihara & May 1990:
plot(ts)
x = cumsum(ts)
plot(x)
hist(ts)
hist(x)
# need to understand what mu=2 means in tent_map defn in rEDMmanual.pdf. Or
#  just generate same tentmap as in S&M 90. Easy enough, and be helpful to
#  reproduce their results.

# Tent map seems to be
tentFun = function(x.init, mu, n)
  {
  # Computes n iterations of tent map, for which
  #  x_{t+1} = mu * min(x_t, 1-x_t)
  #   or equivalently
  #  x_{t+1} = mu/2 * x_t,       for  x_t < 0.5
  #          = mu/2 * (1 - x_t), for x_t >= 0.5
  #
  #  where 0 <= x_t <= 1.    
  # Args:
  #   x.init: initial value of x
  #   mu: parameter defining steepness of tent, leading to rich dynamical
  #        behaviour
  #   n: length of returned vector consisting of n-1 iterations
  #
  # Returns:
  #   vector of length n of iterated values
  #
      if(x.init < 0 | x.init > 1) return("Need x.init in range [0,1].")
      x = vector(length=n)
      x[1] = x.init
      for(t in 1:(n-1))
          {
            x[t+1] = mu * min(c(x[t], 1-x[t]))
          }
      return(x)
  }
