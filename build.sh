#!/bin/bash

cp peach.js peach-min.js

# Compress private keys
perl -pi -e 's/COLLECTION/CL/g' peach-min.js
perl -pi -e 's/ELEMENT/EL/g' peach-min.js
perl -pi -e 's/INDEX/IX/g' peach-min.js
perl -pi -e 's/LOOP_CONSTRUCT/LC/g' peach-min.js
perl -pi -e 's/NAMED_PARAMS/NP/g' peach-min.js
perl -pi -e 's/RETURN/RE/g' peach-min.js
perl -pi -e 's/SOURCE_BODY/SB/g' peach-min.js
perl -pi -e 's/UNROLLED_TARGET_BODY/UB/g' peach-min.js
perl -pi -e 's/TARGET_BODY/TB/g' peach-min.js
perl -pi -e 's/TIMES_TO_UNROLL/XU/g' peach-min.js
uglifyjs --overwrite peach-min.js
