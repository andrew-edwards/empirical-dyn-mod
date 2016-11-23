# ye15origCodeNoFUns.r -  no functions.
# ye15origCode.r - the original code from Ye et al. (2015) PNAS paper
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

source("ye15origCodeFunctions.r")
#---- initial set up ----
preprocess_data()

#---- nonlinear test ----
compute_nonlinearity_aggregated()
test_nonlinearity_aggregated()
compute_nonlinearity_stock()

#---- run EDM models ----
simple_EDM()
multivariate_EDM()

#---- run Ricker models ----
write_model_files()
standard_ricker()
extended_ricker()

# extract_results_for_best_models()

#---- produce figures ----
compute_seymour_ricker_params()
plot_seymour_ricker_halves() # figure 1a
compute_seymour_ricker_env_params()
plot_seymour_env_surface(plot_ricker = TRUE) # figure 1b
plot_seymour_env_surface(plot_ricker = FALSE) # figure 1c
plot_total_returns() # figure 2
plot_rho_comparison() # figure 4

#---- produce supplemental figures ----
plot_nonlinearity() # figure S2
plot_mae_comparison() # figure S3
compute_chilko_smolt_forecasts()
plot_chilko_smolt_model() # figure S4
plot_late_shuswap_CI() # figure S5

#---- produce tables ----
print_env_comparison_table() # table 1
print_nonlinearity_table() # table S1
print_comparison_table() # table S2
compute_ccm()
print_ccm_table() # table S3
print_EDM_env_models() # table S4






