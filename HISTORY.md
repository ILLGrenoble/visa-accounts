3.4.0 03/07/2025
================

3.3.0 06/05/2025
================

3.2.0 14/04/2025
================
 * Update to Node 22
 * Update all dependencies

3.1.0 12/12/2024
================
 * Release version of VISA 3.X: tag alignment of visa-api-server, visa-web, visa-accounts and visa-jupyter-proxy

3.0.0 15/11/2024
================
 * Update github pipeline
 * Update to dual license

2.11.0 09/01/2024
================

2.10.0 20/11/2023
================

2.10.0 20/11/2023
================

2.9.0 16/10/2023
================
 * Add blacklist of userIds and test for invalid IDs given by the attribute provider
 * Verify that the userId returned by the attribute provider is valid

2.8.0 28/04/2023
================
 * Update to node 20 and update all packages.

2.7.0 20/04/2023
================

2.6.0 21/03/2023
================

2.5.0 22/12/2022
================

2.4.0 25/10/2022
================

2.3.0 01/09/2022
================

2.2.3 19/05/2022
================
 * Only cache successful authentication results (avoid caching transient errors)

2.2.2 18/05/2022
================
 * Update dependencies
 * Allow caching of the authentication results (UserInfo or Error)
 * Allow client to specify a timeout for the calls to the SSO
 * Allow specification of a UserInfo Signed Response Alg (eg RS256) for the UserInfo Response from the SSO

2.2.1 02/05/2022
================
 * Fix injection of OpenID DataSource
 * Ensure OpenID connect client is only created once and not at every authentication request
 * Fix Typescript catch syntax errors

2.2.0 22/03/2022
================

2.1.1 26/11/2021
================
 * Fix AuthenticationError not being caught correctly

2.1.0 17/11/2021
================
 * Allow for synchronous provider calls
 * Normalise access token name

2.0.2 30/09/2021
================

2.0.1 16/07/2021
================
 * Set default logging level

2.0.0 15/06/2021
================
 * VISA platform open sourced and moved to GitHub

1.0.0 28/05/2021
================
 * Modifications bringing returned token in line with VISA
 * Initial version cloned from https://github.com/panosc-portal/account-service