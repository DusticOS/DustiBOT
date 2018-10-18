# DustiBOT
General purpose Discord chat bot

  DustiBOT is a personal project for the purpose of helping me refine my programming skills
and to learn new libraries and tools.  It utilizes the discord.js API as well as multiple npm modules:

- Discord.js (For the discord API)
- ytdl-core (For the youtube audio functions)
- console-stamp (For time stamping console logs)

DustiBOT also requires a config.json file that holds the command prefix and the bot token, this will not be made public
Though for future reference, the command prefix that DustiBOT uses is "!".

DustiBOT features a number of automatic functions that happen on specific triggers and are as follows:
-Ready
  Nothing really fancy going on here.  When the bot is turned on, it prints that it is online to the console, in addition it
  sets its status in Discord as playing "nothing suspicious".
-New Member
  When a new user joins the server for the first time, DustiBOT will inform the chat that the new member has joined.
-Presence update
  The bot has an event for when users go on or offline, currently this event has no function.  I'd like to do something with it
  but I don't want the bot to be annoying.

DustiBOT aslo features a number of chat commands that can be used by users to compell the bot to perform specific functions.
DustiBOT will ignore messages sent by other bots or to its DMs.  If the message starts with the command prefix, DustiBOT will 
consider it a command and proceed accordingly.  If the message mentions DustiBOT, it will respond.  If neither condition is true, DustiBOT will ignore the message.  The commands are as follows:
- `!help`
  Provides a list of available commands, the format on how to use them, and the permissions required for each command
- `!poll <poll description>`
  Start a serverwide poll, poll description is the question being posed.
- `!polladd <answer to poll>`
  Provide an additional answer to active poll, or vote for an existing answer.
- `!pollshow`
  Display results of the current poll.
- `!pollend`
  End current poll, only available to admins and user who started original poll
- `!ping`
  DustiBOT will respond with "pong"
- `!remindme <delay> <unit of time> <message>`
  Designates a message for DustiBOT to send in a designated period of time.  the first argument is a number, the second should be a 
  measurement of time, (seconds, minutes, hours, days supported), and the last the message the user wishes to send.
  
- `say <message>`
  DustiBOT will say the provided message and delete the message containing the command to make it appear DustiBOT spoke on its own.
  (NOTE: DustiBOT needs permission to manage messages for the secondary feature of this command to function.)
- `ttssay <message`
  Functions identically to the `!say` command, but DustiBOT will use the text-to-speech feature to say its message.
- `!joinvoice`
  DustiBOT will join the voice channel that the user who used the command is in.
- `!rickroll`
  DustiBOT will join the voice channel that the user who used the command is in and begin playing "Never Gonna Give You Up" by Rick Astley
- `!youtube <youtube URL>`
  DustiBOT will join the voice channel that the user who used the command is in and begin playing the audio from the designated Youtube URL
- `!leavevoice`
  DustiBOT will leave the voice channel.
  
DustiBOT is also capable of responding to mentions, if a user says hello to DustiBOT, it will say hello back.  Similarly, if the user
says goodbye, DustiBOT will bid them farewell.  If the user asks DustiBOT how it is doing, it wil provide a status report.  If the
user thanks DustiBOT, DustiBOT will respond with "your're welcome". If the users tells DustiBOT "Tell me a joke", Dustibot will tell 
one of a few random jokes.
(NOTE: these jokes are really bad, I'm a programmer, not a comedian).
Finally, if the user mentions DustiBOT and none of these other conditions are true, DustiBOT will ask the user if they need anything.

  
