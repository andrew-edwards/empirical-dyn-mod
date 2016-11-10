# rEDMtutorial.r. Trying to understand EDM. Using code from the vignette
#  at https://cran.r-project.org/web/packages/rEDM/vignettes/rEDM_tutorial.html
#  I will just write this as R code to be run one line at a time to help
#  understanding. It looks like the vignette does not directly reproduce
#  the Sugihara and May (1990, Nature 344:734) results, but can maybe be
#  adapted to do so.
#  Andrew Edwards. 4th November 2016

rm(list=ls())
require(rEDM)
require(fNonlinear)         # For the function tentSim(), to compare to my
                            #  tentFun which doesn't seem to work properly.
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
delta = ts[-1] - ts[length(ts)]   
plot(delta)         # has a different range to their Fig. 1a.
hist(delta)

# Need to understand what mu=2 means in tent_map defn in rEDMmanual.pdf. Or
#  just generate same tentmap as in S&M 90. Should be easy enough, and be
#  helpful to reproduce their results.

# Tent map seems to be
tentFun = function(x.init, mu, n)
  {
  # Computes n iterations of tent map, for which
  #  x_{t+1} = mu * min(x_t, 1-x_t)
  #   or equivalently
  #  x_{t+1} = mu * x_t,       for x_t < 0.5
  #          = mu * (1 - x_t), for x_t >= 0.5
  #
  #  where 0 <= x_t <= 1.
  # Args:
  #   x.init: initial value of x, with 0 <= x <= 1
  #   mu: parameter defining steepness of tent, leading to rich dynamical
  #        behaviour (see Wikipedia page for a summary)
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
            # x[t+1] = mu * min( x[t], 1-x[t] )    # seems to give same as:
            x[t+1] = mu * x[t] * (x[t] < 0.5) + mu * (1 - x[t]) * (x[t] >= 0.5)
          }
      return(x)
  }


res1 = tentFun(0.4, 2, 100)
plot(res1)           # Very curious behaviour, where numerical inaccuracies
                     #  creep in, because should just get 0.4, 0.8, 0.4,0.8,...
                     #  but end up with values that end up at 0.
res2 = tentFun(0.123, 2, 100)
plot(res2)
plot(res2[-length(res2)], res2[-1])  # Also heads to 0.

res3 = tentFun(0.123, 1.8, 1000)
plot(res3)
plot(res3[-length(res3)], res3[-1])  # fills in except the low end, not to 0.
delta3 = res3[-1] - res3[-length(res3)]
plot(delta3)       

# Okay, try tentSim() function from fNonlinear package
res4 = tentSim(n=100, n.skip=0, start=0.4)
plot(res4)   # res4 is a time series so it draws lines

res5 = tentSim(n=100, n.skip=0, start=0.123) #, doplot=TRUE)
plot(res5)   # doesn't crash
