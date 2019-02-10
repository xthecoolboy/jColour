=======
jColour
=======

jColour is a Discord bot for managing Discord colour roles.

Links
-----

* Website: https://jcolour.jaqreven.com
* Example site: https://jcolour.jaqreven.com/demo
* Video tutorial: https://jcolour.jaqreven.com/video
* Support: https://jcolour.jaqreven.com/support
* Invite: https://jcolour.jaqreven.com/invite
* Github: https://github.com/jaqreven/jColour

****

===========================
Frequently asked questions
===========================

How do I invite the bot?
------------------------

https://jcolour.jaqreven.com/invite

How do I add colours?
----------------------

#. :ref:`initialsetup`
#. :ref:`createcolours`

How do I get colours?
----------------------

| Normal colours: :ref:`getcolours`
| Hex colours: :ref:`gethex` 

Can I restrict colours to a role?
----------------------------------

Yes! Right over here: :ref:`restricting`

****

.. _getcolours:

================
Getting colours
================

Colour list
------------

#. Type j!colour
#. Open the link the bot sent you
#. Profit

Protip: You can click a colour to see a chat preview.

Specific colour
----------------

#. Choose a colour
#. Type j!colour <colour name> (ex. j!colour red)
#. Profit

Random colour
--------------

#. Type j!colour <random>
#. Profit

Suitable colour
----------------

jColour looks at your avatar and decides which available colour suits it the best.

#. Type j!colour pick
#. Profit

****

.. _gethex:

===================
Getting hex colours
===================

| Make sure hex colours are enabled!
| To see how this is done please refer to :ref:`hex`.

Specific hex colour
--------------------

#. Type j!colour hex #hex (ex. j!colour hex #ff00ff)
#. That's it!

Random hex colour
------------------

#. Type j!colour hex random
#. Done!

Suitable hex colour
--------------------

jColour looks at your avatar and decides which hex colour suits it the best.

#. Type j!colour hex pick
#. Done!

****

=======
Utils
=======

Help
-----

To see all my commands, please refer to j!help.

Prefix 
-------

You can change my prefix with j!prefix:

* j!prefix default
* j!prefix none
* j!prefix !

If you forgot my prefix, you can always tag me instead: @jColour prefix default

****

.. _initialsetup:

=============
Initial setup
=============

This section will tech you what to do when setupping the bot.

Invite
-------

#. Open https://jcolour.jaqreven.com/invite
#. Click the server you want to use (and don't change permissions)
#. Invite the bot

Role Setup
-----------

#. Open the roles of your Discord server
#. Find a role named "jColour"
#. Drag it to the top of the roles list - it should be on top of even the admins. This is required for managing the roles of all users.
#. Remove colours from all roles (except ones you want to use for colours)
#. Save the roles.

****

.. _createcolours:

================
Creating colours
================

Normal colours
---------------

#. Make a role named "colour something" (ex. "colour red")
#. Give that role a colour
#. That's it!

Default colour
---------------

#. Make a role named "colour default"
#. Give that role a colour
#. That's it! Now the colour gets given to all new members on join.

****

.. _restricting:

==============
Restricting
==============

If you want to restrict all colour commands to a certain role:

#. Type j!set-role
#. Reply with the name of the role ("everyone" for no limits)
#. Done! Now only that role can access colours.

You can also restrict hex colours only: :ref:`hex`

****

.. _hex:

=====================
Setup hex colours
=====================

| Hex colours are off by default. 
| Before enabling please note that Discord has a limit of 200 roles.

Enable
------

#. Type j!enable-hex
#. Reply with the name of the role that will be able to use hex colours ("everyone" for no limits)
#. Done! Get back to :ref:`gethex`.

Disable
-------

#. Type j!disable-hex
#. Reply with yes/no: Do you want to delete all the hex roles?
#. Done! No more hex colours.

****

=============
Final notes
=============

Data Collection
---------------

| jColour doesnt explicitly collect any data, though some might get saved to Apache & PM2 logs and SQL databases.
| This includes but may not be limited to:

* Anonymous command executions
* Sites accessed 
* Server prefixes
* Discordbots.org votes (id, vote date)

License
--------

Copyright (c) 2017-2018 Jaakko Repo

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.