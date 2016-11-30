# OpenWhisk Entity Noodler

This tool provides a viewer over your OpenWhisk entities.

Run:

 1. `npm install -g owen`
 2. `owen`
 
By default, owen will constraint its columns to 40 characters. You can widen this to 80 by passing a `-w` flag. You can tell owen not to constraint column width by passing a `-f` flag.

You are expected to have working OpenWhisk credentials. In particular, the file ~/.wskprops should exist and be complete.

If you can run wsk activation list without issue you are probably all set.

Note that owen requires Node 6 or later.
