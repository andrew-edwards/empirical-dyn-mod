# rEDMtutorial.r. Trying to understand EDM. Using code from the vignette
#  at https://cran.r-project.org/web/packages/rEDM/vignettes/rEDM_tutorial.html
#  I will just write this as R code to be run one line at a time to help
#  understanding. It looks like the vignette does not directly reproduce
#  the Sugihara and May (1990) results, but can be adapted to do so.
#  Andrew Edwards. 4th November 2016

require(rEDM)
data(tentmap_del)

ts = tentmap_del            # ts is the time series of data
lib = c(1, 100)             # the library to construct the model
pred = c(201, 500)          # the prediction set to test the model

simplex_output <- simplex(ts, lib, pred)
?simplex


