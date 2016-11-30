# OpenWhisk Entity Noodler

This tool provides a viewer over your OpenWhisk entities.

Run:

  1. `npm install -g owen`
  2. `owen`
 
By default, owen constrains its columns to 40 characters. You can widen this to 80 by passing a `-w` flag. You can tell owen not to constrain column width by passing a `-f` flag.

You are expected to have working OpenWhisk credentials. You can [get them here](http://console.ng.bluemix.net/openwhisk/cli). In particular, the file `~/.wskprops` should exist and be complete.

If you can run `wsk activation list` without issue you are probably all set.

Note that owen requires Node 6 or later.
