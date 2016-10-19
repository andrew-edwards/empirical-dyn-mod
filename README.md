# empirical-dyn-mod
Initial investigations and ideas regarding Empirical Dynamic Modelling

[New users see the end of this file to get started]

## Ideas and notes stemming from 16/9/16 meeting (Andy Edwards, Carrie Holt, Sue Grant)

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
4. Could ask Hao what they're doing with the multiview embedding (MVE) and Fraser River Sodckeye.
5. Just play with the code to understand it more.
6. Ask Alida and others what kind of data sets they have.
7. Better understand how the methods can be used for forecasting. 
8. Understand how to deal with uncertainty of results.


###For the Ecosystem Approach workshop

1. Need better understanding of the methods.
2. Need code running for at least the Fraser River Sockeye so we can extend it and explore further ideas.
3. Have code running for one theoretical model.
4. Have code set up for multispecies time series, if anyone is bringing one to the workshop. 



## Instructions for new users

The **simplest option** below is quick, but the **better option** will be much better for collaborating in the workshop.

**Simplest option** (but does not facilitate collaboration or updating of files). To do a one-time download of all the current files from the GitHub site, click the 'Clone or Download' button (near the top on the right) and select 'Download ZIP'. Make a note of the 'Latest commit' number in case you have any questions for me. 

**Better option** (preferred) to properly use GitHub, keep up with updates to the files by others, and allow you to contribute (adding papers and code). You need to do the following:

### One time things to get started using git and GitHub

From <a href="https://github.com/andrew-edwards/git-workshop">my adapted version</a> of Chris Grandin's git workshop tutorial:

1. You will need to <a href="https://github.com/" target="_blank">sign up for GitHub</a>, which you've presumably already done as you're viewing this *private* 'repository'.

2. GitHub *requires* Microsoft .NET 4.5.1 as of February 2014. If you have a .NET version less than 4.5 ([Check version](https://github.com/downloads/shanselman/SmallestDotNet/CheckForDotNet45.exe "Which .NET version is on my machine?")), then upgrade it: <a href="http://go.microsoft.com/fwlink/p/?LinkId=310158" target="_blank">Microsoft .NET 4.5.1</a>.

3. Install <a href="http://windows.github.com" target="_blank">GitHub for Windows</a>

4. Go back to Andy's version of the [empirical-dyn-mod repository](https://github.com/andrew-edwards/empirical-dyn-mod) (where you're reading this), make sure you are signed in to GitHub, and **Fork** the project (button on the top right). This will create a copy of the repository on your GitHub site. I think the website you are viewing should then change to **https://github.com/your-github-user-name/empircal-dyn-mod** (but I can't test this). From the [GitHub glossary](https://help.github.com/articles/github-glossary/#repository): "A repository is the most basic element of GitHub. They're easiest to imagine as a project's folder. A repository contains all of the project files (including documentation), and stores each file's revision history. Repositories can have multiple collaborators and can be either public or private." 

5. Open the GitHub Application. Choose Tools->Options and under *configure git*, fill in your name, the email address you used for signing up to GitHub,
and change your *default storage directory* to something simple that you will be able to find later. It's good to have all your GitHub based projects in this directory, so something like **c:\github** (best to avoid spaces). Make sure that for
*default shell*, *PowerShell* is checked. *pull behavior* should have *use rebase for pulls* checked. Click *Update* and close the application.
**This is a one-time step and you will not need to do it again unless you want to sign in with a different user name.**

### To get the repository onto your computer

1. Open the Git Shell, (not the GitHub application). The shortcut should be at (maybe copy it to somewhere useful):
**C:\Users\your-computer-user-name\AppData\Local\GitHub\GitHub.appref-ms --open-shell**

2. Note your starting directory, this is where your files will be. It should be the same as the one you entered into the GitHub application in the steps above.

Type the following to clone your repository onto your local machine:

      git clone https://github.com/your-github-user-name/empirical-dyn-mod

Now you have all the files on your computer.

### To change the files and then *push* then back to GitHub

Not done yet....