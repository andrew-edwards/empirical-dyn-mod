# empirical-dyn-mod
Initial investigations into Empirical Dynamic Modelling and ideas with Carrie and Sue  

## Ideas and notes stemming from 16/9/16 meeting

Approach looks promising. We don't fully understand it yet, particularly the math. Also need some more testing and examples to be convinced.

Will be something worth pursuing at the Ecosystem Approach workshop, and we could have a breakout group to work on it for three days (Rowan is keen to be a part).

There's a full CSAS meeting in May/June 2017 of a review of the modelling approaches for (Fraser River?) Sockeye Salmon. It could be good to present something there, though timewise I expect we may not be able to get too much done.

Potential ideas (in slightly random order):

###Expanding from Sockeye PNAS paper
 
1. Reproduce Figure 4 of PNAS Sockeye paper.
2. Add in some spurious forcing that should have no effect and see how the methods cope with that. This would be a more convincing approach for people than understanding Takens' theorem.
3. Test other metrics from MacDonald et al. (2012) Res. Doc.

macDonald12sockeye.pdf - Res. Doc. has the performance metrics. Sue thinks that they used those ones also but justified the one that they presented (which happened to be the best). Be good for us to investigate the metrics.


###Expanding from Ye et al. (2016) 'Information leverage...' Science paper

1. Get the Hastings and Powell (1991) model working to reproduce what they did. There is recent code on the rEDM GitHub site.
3. If that is doable then maybe apply to Edwards and Brindley (1996 or 1999) NPZ (nutrient-phytoplankton-zooplankton) model with forcing and noise. This would be good because the dynamical behaviour (without noise) is somewhat understood, as is effect of adding a detritus compartment and changing zooplankton mortality. Can look at areas of parameter space that, without forcing or stochasticity, have a chaotic attractor or just limit cycles (oscillations) or just steady states.   
2. Understand the time downsampling issue. 
4. Could ask Hao what they're doing with the multiview embedding (MVE) and Fraser River Sockeye.
5. Just play with the code to understand it more.
6. Ask Alida and others what kind of data sets they have.
7. Better understand how the methods can be used for forecasting. 
8. Understand how to deal with uncertainty of results.




