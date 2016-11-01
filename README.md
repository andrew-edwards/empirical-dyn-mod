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

The **simplest option** below is quick to do a one-time download of the files and papers that I've put together. But the **better option** will be much better for collaborating in the workshop.

**Simplest option** (but does not facilitate collaboration or updating of files). To do a one-time download of all the current files from the GitHub site, click the 'Clone or Download' button (near the top on the right) and select 'Download ZIP'. Make a note of the 'Latest commit' number in case you have any questions for me. 

**Better option** (preferred) to properly use GitHub, keep up with updates to the files by others, and allow you to contribute (adding papers and code). You need to do the following:

### One time things to get started using git and GitHub

Some of this is from <a href="https://github.com/andrew-edwards/git-workshop">my adapted version</a> of Chris Grandin's git workshop tutorial. Please keep a note of anything that didn't work or could be made clearer - once you get comfortable with using GitHub you'll be able to simply edit these notes and I can accept your changes so that others don't run into the same issues.

**These are one-time steps and will not need to be done again**

1. You will need to <a href="https://github.com/" target="_blank">sign up for GitHub</a>, which you've presumably already done as you're viewing this *private* 'repository'.

2. GitHub *requires* Microsoft .NET 4.5.1 as of February 2014. If you have a .NET version less than 4.5 ([Check version](https://github.com/downloads/shanselman/SmallestDotNet/CheckForDotNet45.exe "Which .NET version is on my machine?")), then upgrade it: <a href="http://go.microsoft.com/fwlink/p/?LinkId=310158" target="_blank">Microsoft .NET 4.5.1</a>.

3. Install <a href="http://windows.github.com" target="_blank">GitHub for Windows</a>

- You will also need the **.gitconfig file** that includes a bunch of aliases that Chris Grandin set up (which make it easier to use some common commands):

 - Go to [https://raw.githubusercontent.com/andrew-edwards/git-workshop/master/.gitconfig](https://raw.githubusercontent.com/andrew-edwards/git-workshop/master/.gitconfig)

 - Right-click anywhere on the main text, Save-As, and save it in your equivalent of **C:\Users\edwardsand\** (where you replace **edwardsand** with the username you use to log in to your computer). I think that's the defaul place, it's where I found it on on my computer.  
 
 - Open **C:\Users\edwardsand\.gitconfig** in a text editor and change the name and email address at the top from Chris's to yours.  
 

- The file you're reading is a Markdown file (filename is **README.md**). You can read it in any text editor (as it's just ASCii text), but to get the formatting etc. (and see things in **bold** or *italics*) you’ll also want an editor that knows how to view these. I use Markdown Pad 2 which is easy to use. It’s at  [http://markdownpad.com](http://markdownpad.com/). Just get the free version. 

- Go back to Andy's version of the [empirical-dyn-mod repository](https://github.com/andrew-edwards/empirical-dyn-mod) (where you're reading this), make sure you are signed in to GitHub, and **Fork** the project (button on the top right). This will create a copy of the repository on your GitHub site. I think the website you are viewing should then change to **https://github.com/your-github-user-name/empircal-dyn-mod** (but I can't test this). From the [GitHub glossary](https://help.github.com/articles/github-glossary/#repository): "A repository is the most basic element of GitHub. They're easiest to imagine as a project's folder. A repository contains all of the project files (including documentation), and stores each file's revision history. Repositories can have multiple collaborators and can be either public or private." 

5. Open the GitHub Application. Choose Tools->Options and under *configure git*, fill in your name, the email address you used for signing up to GitHub,
and change your *default storage directory* to something simple that you will be able to find later. 

 - It's good to have all your GitHub based projects in this directory, so something like **c:\github** or anything you like, but ***AVOID USING SPACES IN FILENAMES AND DIRECTORY NAMES*** [this is generally good practice but will avoid potential problems; make sure you add the new directory name to your back up software if you want to back your files up as normal]. 
 - Make sure that for *default shell*, *PowerShell* is checked. *pull behavior* should have *use rebase for pulls* checked. Click *Update* and close the application.

### To get the repository onto your computer

1. Open the Git Shell, (not the GitHub application). The shortcut should be at (maybe copy it to somewhere useful):
**C:\Users\your-computer-user-name\AppData\Local\GitHub\GitHub.appref-ms --open-shell**

2. Note your starting directory, this is where your files will be. It should be the same as the one you entered into the GitHub application in the steps above.

Type the following to clone your repository onto your local machine:

      git clone https://github.com/your-github-user-name/empirical-dyn-mod

Now you have all the files on your computer.

### To change the files and then *push* then back to GitHub

Okay, now to get started. It's easier to be shown by someone and for explaining the concepts, but basically I only end up using a few basic commands. These are typed in the Git Shell. If you are in your **C:/...../github/** directory then you should see a standard DOS prompt, something like:

	C:\user-name\github> 

Then **ls** or **dir** will show you the subdirectories, and you should only have **empirical-dyn-mod** if this is your first use of GitHub.

So change directory 

	cd empirical-dyn-mod

[note that you can use Tab to complete unique commands]. The prompt now says something like

	C:\user-name\github\empirical-dyn-mod [master]>

with **master** in blue. This last bit tells you that you are in a directory that is being tracked in a GitHub repository (don't worry about why it's called master yet). 

### The basic commands that I use are:

      git s                             <View status of the repository>
      git com "MESSAGE"                 <Commit changes with message>
      git add filename                  <Add 'filename' (including path) to the list of files being tracked by git>
	  git push							<Push your changes to GitHub>
	  git fetch ****					<fetch changes that someone else has made>
	  git merge							<merge the fetched changes with your local repository>

In more detail:

	git s

is short for **git status**, and tells you if everything is 'up to date'.

	git com "Comment here"

is short for **git commit**. Once you have made a change to a file then you can 'commit' it to your repository. Git then notes that commit, but in such a way that you can **always go back to earlier versions of the file**. You do not end up with multiple copies of the same file in your directory - Git efficiently keeps track of the **differences** but in hidden folders.

Each commit needs a comment describing what you did, such as

	git com "Updated README.md with comments about commiting."
 
Next,

	git add filename

tells git to keep track of changes to that filename in this repository (so you do this when you create a new file). To ignore a file, you add that file to the **.gitignore** file for that repository. Don't worry about that for now.

	git push

pushes your commits back to the version of your repository that is on your GitHub web page.

###To collaborate with others

Now, the true value of git and GitHub is in collaborating on code or documents. Having forked my repository and then cloned it your computer you have a copy of my files. But what about keeping up-to-date with what I've been doing, and then doing some work yourself that I can then merge into my files? We may not use this full functionality for this project, but in case, here is what we do.

Look at the Network Graph for your repository: go to your GitHub site for this repository, and click Graphs and then Network. Your (GitHub) name should be on the left, with a series of nodes (each representing a commit) to the right in the graph. If you see someone else's name below yours, it means that they have pushed something to their repository that you don't yet have. You can hover over each node to see the commit message associated with each commit. 

If you cannot see anyone else's name then no-one is ahead of you, and you are up to date (this is good!). 

So, to incorporate my (Andy's) latest commits, you need to (just once) do: 

       git remote add aedwards https://github.com/andrew-edwards/empirical-dyn-mod

You can use anything you like instead of 'aedwards', but we've found it consistent to use this format for when we are involving multiple people. 

Then, to fetch (from GitHub) the latest version of mine:

	git fetch aedwards

I think you can do 

	git diff aedwards/master

which will show the differences between our repositories, but it's not super clear. [I now use difftool I think which is likely better, but I haven't done merging for a while].

Then to merge my version of the repository with your own repository, do

	git merge aedwards/master

If we have no **conflicts** then the merge will work fine. A conflict is where we have both changed a file in the same place [line number] since the repositories diverged from each other. Then **git com "..."** (though a merge may automatically do one?) and **git push** as usual. Then look at the Network Graph page again (refresh it), and it should look different - the repository you merged from should not show up, since you are now up to date with it.

When there is a conflict you will get a message. Then open the relevant file in a text editor, and it has <<<<<<   for the start of a conflicting part, and ========= at the end, so manually fix it. Basically you decide which part of the conflicting code you want to keep.

Then **git add <filename>** to confirm that's the one you want (that step is not completely obvious), then **git com "..."** as usual. See <https://help.github.com/articles/resolving-a-merge-conflict-from-the-command-line/>

Generally we try and work on different files so that there are no conflicts when we merge.

I've purposefully glossed over a few technical things to get you started, and haven't fully explained why things are done. When I started our I tried to read up about GitHub a bit, but it can be very technically described (requiring a strong computer science background) so not overly helpful, with lots of references to other 'version control systems' that you never used in the first place.

A readable introduction to the general ideas of 'version control' is the manuscript <a href="https://arxiv.org/abs/1609.00037">Good Enough Practices in Scientific Computing</a> (thanks to Carrie for passing this on).

###Simple example

Maybe worth giving a simple example....
thanks!