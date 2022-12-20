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