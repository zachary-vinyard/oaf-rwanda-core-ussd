# oaf-rwanda-core-ussd
Core library for USSD interaction Rwanda

Three main shortcode configurations are included here:

Core: Main function in core.js.  Main library for functions for TUBURA clients, excluding enrollment. Currently mapped to \*801\*0#

External: Marketing call to action library. Main function in external.js. Mapped to \*801\*8#

Enrollment: Library for all mobile enrollment. Main function in enrollment.js. Unmapped at current time.

Enrollment module depends on several tables:
1. ussd_settings
2. glus_ids, with required fields glus_id, geo, nid
.
.
.