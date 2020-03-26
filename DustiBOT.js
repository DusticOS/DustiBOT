/*TODO:
	-Organize various commands into functions
		-Really just more organizing in general
	-Set up external storage, preferably a database of some kind, for storing important long term data
		-should allow bot to be have some personalization options server to server
	-Find some way to utilize the presence update event
	-Create more responses for when the DustiBOT is mentioned
	*/


//variables that hold required inputs
const logStamp = require('console-stamp')(console, '[HH:MM:ss.l]');
const Discord = require("discord.js");
const ytdl = require('ytdl-core');
const client = new Discord.Client();
//import config file
const config = require("./config.json");
//list of banned words

//array stat stores valid commands that can be checked before users go through the command list
const commands = ["help","poll","polladd","pollshow","pollend","ping","say","ttssay","remindme","joinvoice","rickroll","youtube","leavevoice", "roll"];
		
	
//ready event, this triggers when the bot logs on
client.on("ready", () => 
{
	//print to the console that the bot is online
	console.log("DustiBOT online");
	//Set the bot's "Playing" status
	client.user.setActivity("nothing suspicious");
});

//guildmember add event, triggers when a new user joins the server
client.on("guildMemberAdd", (member) => 
{
	//Informs the chat that a new user has joined the channel
	console.log("New User: " + member.user.username.toString() + " has joined " + member.guild.name.toString());
});

//presence update event, triggers when a user goes on or offline
//oldmember is the user's guildmember object before the presence change, newmember is their object afterward
client.on("presenceUpdate", (oldmember, newmember) => {
	/*if(oldmember.presence.status === "offline" && newmember.presence.status === "online")
	{
		console.log(newmember.displayName + " has come online.");
	}
	else if(oldmember.presence.status === "online" && newmember.presence.status === "offline")
	{
		console.log(newmember.displayName + " has gone offline.");
	}*/
});

//message event, triggers when a message is recieved by the bot
client.on("message", (message) => 
{
	//prevents bots from calling other bots
	if(message.author.bot) 
	{
		return;
	}
	//checks if the recieved message was in the bot's personal messages
	if(message.channel.type === "dm")
	{
		//if so, print the message and who sent it to the console and return
		return console.log("PM from " + message.author.username.toString() + ": " + message.content);
	}
	
	//returns if the message does not start with the prefix.
	//anything within this if statement denotes a command
	if(message.content.indexOf(config.prefix) === 0)
	{
		//stores arguments then turns them to lower case
		const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
		const command = args.shift().toLowerCase();
		
		if(!commands.includes(command))
			return message.channel.send("That is not a valid command, please use `!help` for a list of valid commands.");
			
		//prints a list of available commands
		if(command === "help")
		{
			return message.channel.send("!poll (All)\n!remindme <delay> <unit of time> <message> (All)\n!ping (All)\n!say <Text for bot to say> (Admin)\n!ttssay<Text for bot to say> (Admin)\n!joinvoice (Admin)\n!rickroll (Admin)\n!youtube <URL to link to be played> (Admin)\n!leavevoice (Admin)\n!help (All)");
		}
		//Command that starts a poll: "!poll <Question to be asked>"
		if(command === "poll")
		{
			return poll(message, args);
		}		
		//command that returns the ping
		if(command === "ping")
		{
			return message.channel.send("pong");
		}
		//command that tells the bot to send a message to chat after a predetermined time period: "!remindme <delay> <unit> <message to be sent>"
		if(command === "remindme")
		{
			return remindMe(message, args);
		}
		if(command === "polladd" || command === "pollend")
		{
			return;
		}
		if(command === "roll")
		{
			let result = roll(args)
			if(result == -1)
			{
				return message.channel.send("Error: use format </roll xdy> where x and y are numbers");
			}
			else if(result == -2)
			{
				return message.channel.send("Error: Cannot roll more than 100 dice or a dice of more than 100 sides.")
			}
			return message.channel.send(message.author.toString() + " rolled " + result);
		}
		//check the user's permissions before checking for the following commands, return and inform user they do not have permissions if they do not.
		if(!message.member.hasPermission("ADMINISTRATOR"))
		{
			return message.reply("You do not have permission for this command");
		}
		//command that directs bot to inform user that it is ready to obey
		//command that allows user to speak through bot
		if(command === "say")
		{
			//save the argument as sayMessage
			const sayMessage = args.join(" ");
			//delete the message that contained the command
			message.delete().catch(O_o=>{});
			//make sure that there was an argument to be sent
			if(!sayMessage)
			{
				return message.reply("No argument, please include a message to be sent: !say <argument>");
			}
			//print the requested message
			return message.channel.send(sayMessage);
		}
		//command that allows user to speak through bot using text-to-speech.
		if(command === "ttssay")
		{
			//functions identically to !say, but includes a tts flag
			const sayMessage = args.join(" ");
			message.delete().catch(O_o=>{});
			if(!sayMessage)
			{
				return message.reply("No argument, please include a message to be sent: !ttssay <argument>");
			}
			//print the requested message, set tts flag to true
			return message.channel.send(sayMessage, {tts: true});
		}
		//command that tells the bot to joina voice channel
		if(command === "joinvoice")
		{
			//saves the voice channel that the user calling the command is in to the vc variable, this is where the bot is going to join
			let vc = message.member.voiceChannel;
			//if the user was not in a voice channel this value will not be saved and the bot will not be able to join
			if(!vc)
			{
				//inform the user the bot cannot join an empty voice channel
				return message.channel.send("Cannot join empty voice channel, please join a channel and try again.");
			}
			//otherwise the bot will join the designated voice channel
			else
			{
				//join designated voice channel
				vc.join()
					//connection event, send a message to console on successful connection
					.then(connection => {
					console.log("Connected!")
					})
					//if any errors, print to console
					.catch(console.error);
			}
		}
		//similar to !joinvoice, but plays "Never Gonna Give You Up" by Rick Astley upon joining.  If the bot is already in a channel, it will play it there
		//the way this command works, the bot will join the channel of whoever calls it, thus if the bot is in channel A, and this command is used from channel B, the bot will join channel B and play the song
		if(command === "rickroll")
		{
			//create a broadcast for the client
			const broadcast = client.createVoiceBroadcast();
			
			//set the voice channel to the one the user calling the command is in
			let vc = message.member.voiceChannel;
			//if the user is not in a voice channel, print an error and return
			if(!vc)
			{
				return message.channel.send("Cannot join empty voice channel, please join a channel and try again.");
			}
			//otherwise, commence rickrolling
			else
			{
				//join designated voice channel
				vc.join()
				//connection event, upon succesful connection, use the broadcast to play the NGGYU file, make sure this file is in the folder else this will fail.
				//reduce volume to 10%
					.then(connection => {
					//console.log('Connected!')
					broadcast.playFile("Songs/NGGYU.mp3", {volume: .1});
					const dispatcher = connection.playBroadcast(broadcast);
					})
					.catch(console.error);
			}
		}
		//command that plays the audio from a designated youtube link: "!youtube <youtube URL>"
		if(command === "youtube")
		{
			//create broadcast			
			const broadcast = client.createVoiceBroadcast();
			//save voice channel
			let vc = message.member.voiceChannel;
			//save provided argument
			const obj = args.join(" ");
			//check if user is in a voice channel and that there is an argument, return and print an error if false
			if(!vc)
			{
				return message.channel.send("I'm not going to go in a voice channel alone. Get in one first then try again.");
			}
			if(!obj)
			{
				return message.channel.send("What do you want me to play?");
			}
			else
			{
				//join a voice channel
				vc.join()
				//connection event
					.then(connection => {
					console.log('Connected!')
					//access youtube stream, only play audio at 100% volume
					const stream = ytdl(obj, {
					filter: 'audioonly', volume: 1});
					//play new stream through broadcast, reduce audio to 10%
					broadcast.playStream(stream, {filter: 'audioonly', volume: .1});
					const dispatcher = connection.playBroadcast(broadcast);
					})
					//print errors to console if any
					.catch(console.error);
			}
		}
		//command that tells bot to leave voice channel
		if(command === "leavevoice")
		{
			leaveVoice(message);
		}
	
		//Command that tells the bot to log off bot to log off
		//should not be available for general use
		/*if(command === "exit")
		{
			message.channel.send("Logging off!");
			client.destroy();
		}*/
	}
	
	//if the message is not a command, the bot will run this instead
	else
	{
		//checks if the bot was mentioned
		if(message.isMentioned(client.user))
		{
			//greets user when bot is greeted
			if(message.content.toLowerCase().includes("hello"))
			{
					return message.channel.send("Hello, " + message.author.toString() + "!");
			}
			//responds with a "You're welcome" if the bot is thanked
			else if(message.content.toLowerCase().includes("thank you") || message.content.toLowerCase().includes("thanks"))
			{
					return message.channel.send("You're welcome!");
			}
			//Informs the user of the bot's condition if asked how it is doing
			else if(message.content.toLowerCase().includes("how are you"))
			{
					return message.channel.send("All systems are nominal.  Thank you for asking!");
			}
			//tells the user a joke
			else if(message.content.toLowerCase().includes("tell me a joke"))
			{
				//select a random value between 0 and 6
				var jokeVal = Math.floor(Math.random() * 7);
				//tells a joke based on random value
				switch(jokeVal)
				{
					case 0:
						return message.channel.send("There are only 10 types of people in the world.  Those that understand binary, and those that don't.");
						break;
					case 1:
						return message.channel.send("404 JOKE NOT FOUND");
						break;
					case 2:
						return message.channel.send("There's no place like 127.0.01!");
						break;
					case 3:
						return message.channel.send("01001001 00100111 01101101 00100000 01100001 01100110 01110010 01100001 01101001 01100100 00100000 01101001 01100110 00100000 01001001 00100000 01110100 01100101 01101100 01101100 00100000 01111001 01101111 01110101 00100000 01100001 00100000 01101010 01101111 01101011 01100101 00100000 01101001 01101110 00100000 01101101 01111001 00100000 01101100 01100001 01101110 01100111 01110101 01100001 01100111 01100101 00101100 00100000 01001001 00100111 01100100 00100000 01101000 01100001 01110110 01100101 00100000 01110100 01101111 00100000 01100101 01111000 01110000 01101100 01100001 01101001 01101110 00100000 01101001 01110100 00101110");
						break;
					case 4:
						return message.channel.send("Why do Java developers wear glasses? \n Because they can't C#!");
						break;
					case 5:
						return message.channel.send("If I had a preferred gender pronoun, I'd probably be binary.");
						break;
					case 6:
						return message.channel.send("My creator tried to program me on python, but it didn't take long to figure out keyboards bite less.");
						break;
					default:
						return message.channel.send("404 JOKE NOT FOUND");
						break;
				}
			}
			//bids farewell if told goodbye
			else if(message.content.toLowerCase().includes("goodbye"))
			{
				return message.channel.send("See you later, " + message.author.toString() + "!");
			}
			//asks user if it needs anything if bot is tagged without obvious request
			else
				return message.channel.send("Oh, did you need something?");
		}
	}
});

function leaveVoice(message)
{
	let vc = client.guilds.get(message.guild.id).voiceConnection;
	if(vc === null)
	{
		message.channel.send("I can't leave a voice channel I'm not in!");
	}
	else
	{
		vc.channel.leave();
	}
}

function remindMe(message, args)
{
	//variable that stores the delay value
	let timeDelay = args[0];
	//value that stores the delay in miliseconds (conversion later)
	let timeDelayMil = timeDelay;
	//variables that stores the unit of time to be used
	let timeUnit = args[1];
	//variables that stores the message that will be sent
	let msg = args.slice(2).join(" ");
	
	//check if any of the arguments are missing, provide user with correct command format if false and return
	if(!timeDelay || !timeUnit || !msg)
	{
		return message.channel.send("Error: Invalid Syntax.  Please use format: !remindme <Delay> <Unit of time> <Message>");
	}
	//check which unit of time was requested and convert timeDelayMil as appropriate
	//takes into account user might not use the plural of their unit (In the case for counts of "1" as the delay)
	if(timeUnit === "seconds" || timeUnit === "second")
	{
		timeDelayMil = timeDelay * 1000;
	}
	else if(timeUnit === "minutes" || timeUnit === "minute")
	{
		timeDelayMil = timeDelay * 60000;
	}
	else if(timeUnit === "hours" || timeUnit === "hour")
	{
		timeDelayMil = timeDelay * 3600000;
	}
	else if(timeUnit === "days" || timeUnit === "day")
	{
		timeDelayMil = timeDelay * 3600000 * 24;
	}
	//if the unit was not one of these options, inform the user that they have provided an invalid unit and request a valid one, return.
	else
	{
		return message.channel.send("Please designate a valid unit of time.");
	}
	//Inform user that the command has gone through, confirm the provided information
	message.channel.send("Roger that! I'll let you know in " + timeDelay + " " + timeUnit);
	//set timeout function, set delay equal to the delay in milliseconds, set the functions to a simple message send using the provided message, return.
	return setTimeout(function msgSend() {message.reply(msg);}, timeDelayMil);
}
function poll(message, args)
{
	if(!message.channel.activePoll || message.channel.activePoll === false)
	{
		//active poll stores whether or not there is currently a poll on the server
		
		
		//save argument to const obj
		const obj = args.join(" ");
		//if no argument, return and inform user that an argument is required
		if(!obj)
		{
			return message.channel.send("What should I make the poll about? Please provide an argument: `!poll <argument>`.");
		}
		//establish that there is an active poll, and make the current poll equal to the argument.
		message.channel.activePoll = true;
		//the poll answer array is an array that stores the individual answers, the count of how many users support that answer, and the usernames of those users
		message.channel.pollAnsArr = [];
		//Save the author of the poll for permission purposes
		message.channel.pollCreator = message.author.id.toString();
		//current poll stores the contents of the active poll
		message.channel.currentPoll = obj;
		//Send a message to the channel to inform users of the new poll, provide instructions for participating
		message.channel.send("NEW POLL: " + obj);
		message.channel.send("Use `!polladd <Your answer>` to add an answer, `!pollshow` to see current results, and `!pollend` to end the poll!");
		const filter = m => m.content.indexOf(config.prefix) === 0;
		const collector = message.channel.createMessageCollector(filter);
		
		collector.on('collect', m => 
		{
			const a = m.content.slice(config.prefix.length).trim().split(/ +/g);
			const cmd = a.shift().toLowerCase();
			if(m.author.bot)
			{
				m.channel.send("Error: bots cannot participate.");
			}			
			else if(cmd === "polladd")
			{
				pollAdd(m, a);
			}
			else if(cmd === "pollshow")
			{
				pollShow(m);
			}
			else if(cmd === "pollend")
			{
				if(pollEnd(m))
				{
					collector.stop("Ended by user");
				}
			}
		});
		collector.on('end', collected => 
		{
			message.channel.activePoll = false;
			//check if there are any answers, if there are none, end the poll and inform the chat that there are no winners
			if(!message.channel.pollAnsArr[0])
			{
				message.channel.send("Poll `" + message.channel.currentPoll + "` ended with 0 responses");
			}
			else
			{
				//Inform the chat the poll is over
				message.channel.send("Poll: `" + message.channel.currentPoll + "` ended.");
				//sort the responses to the poll by their frequency
				message.channel.pollAnsArr.sort(function(a, b){return b.freq - a.freq});
				//loop through the now sorted responses and list them with their number of responses
				for(var i = 0; i < message.channel.pollAnsArr.length; i++)
				{
					message.channel.send(message.channel.pollAnsArr[i].freq + " | " + message.channel.pollAnsArr[i].ans);
				}
				//Announce the winner with its vote total
				message.channel.send("\"" + message.channel.pollAnsArr[0].ans + "\" is the winner with " + message.channel.pollAnsArr[0].freq + " votes!");
			}
		});
	}
	else
	{
		return message.channel.send("There is already an active poll on this channel.");
	}
	return;
}
function pollAdd(message, args)
{
	//Save the argument after the command
	const obj = args.join(" ").toLowerCase();
	//If no argument was included, return and inform the user that they need an argument
	if(!obj)
	{
		message.channel.send("What should I add to the poll? Please provide an answer: `!polladd <argument>`");
		return;
	}
	//if there is an active poll and an included argument, proceed
	else
	{
		//loop through the array of answers
		for(var i = 0; i < message.channel.pollAnsArr.length; i++)
		{
			//Check if the answer at element 'i' has any users that have voted for it.  This is because users can change their answer.
			//So we need to check if the answer's user array even has contents before we can try and loop through it
			if(message.channel.pollAnsArr[i].usr)
			{
				//loop again (nested loops, I know) this time through the user array that we now know has contents
				for(var j = 0; j < message.channel.pollAnsArr[i].usr.length; j++)
				{
					//check if the author of the !polladd is in the answer element 'i' user array, and hence has voted for that answer
					if (message.channel.pollAnsArr[i].usr[j] === message.author.id.toString())
					{
						//if true, check if the author tried submitting the same answer, if true inform them that this is the case and return
						//this is to prevent users from spamming the poll and inflating their answer
						if(message.channel.pollAnsArr[i].ans === obj)
						{
							message.channel.send("You already said that answer!");
							return;
						}
						//If false, remove the user from the current user array, and reduce the count on answer element 'i', inform the user that their answer has changed and break from the loop
						//we do not add them to the new new answer yet, break from the loop and continue
						else
						{
							message.channel.send("Your previous answer has been replaced!");
							delete message.channel.pollAnsArr[i].usr[j];
							message.channel.pollAnsArr[i].freq--;
							break;
						}
					}
				}
			}
		}
		//loop that loops through the answers again, it is necessary to do this separately to prevent the bot from getting confused.
		//Since both loops are searching for different information
		for(var i = 0; i < message.channel.pollAnsArr.length; i++)
		{
			//Check if answer at element is the same as the submitted answer
			if(message.channel.pollAnsArr[i].ans === obj)
			{
				//if true, update that answer's frequency and add the author to that answer's user array, inform the chat that the answer now has an additional supporter and return
				message.channel.pollAnsArr[i].freq++;
				message.channel.pollAnsArr[i].usr.push(message.author.id.toString());
				message.channel.send("\"" + message.channel.pollAnsArr[i].ans + "\"" + " now has " +  message.channel.pollAnsArr[i].freq + " responses.");
				return;
			}
		}
		//in the case that the loop is completed without finding a equivalent answer, create an object that stores:
		//1. The submitted answer
		//2. The number of users in support of the answer (Always starts at 1 in this case)
		//3. The author of the message so we know that they have answered and what they are in support of
		//push the new answer to the answer array
		let pAnswer = {ans: obj, freq: 1, usr: [message.author.id.toString()]};
		message.channel.pollAnsArr.push(pAnswer);
		//Inform the chat that the submitted answer has been added
		message.channel.send("\"" + message.channel.pollAnsArr[message.channel.pollAnsArr.length - 1].ans + "\"" + " has been added as an answer.");	
		return;
	}
}

function pollShow(message)
{
	if(message.channel.pollAnsArr.length < 1)
	{
		message.channel.send("Poll: `" + message.channel.currentPoll + "` currently has no results.");
		return;
	}
	message.channel.send("Poll: `" + message.channel.currentPoll + "` Current Results:");
	for(var i = 0; i < message.channel.pollAnsArr.length; i++)
	{
		message.channel.send(message.channel.pollAnsArr[i].freq + " | " + message.channel.pollAnsArr[i].ans);
	}
	return;
}

function pollEnd(message)
{
	//check if the user who initiated the pollend has permission to end the poll
	//if they do not, inform them they cannot end the poll and then return
	//The users who have permission to end the poll are the server admins, and the user who created the poll
	if(!(message.author.id.toString() === message.channel.pollCreator) && !message.member.hasPermission("ADMINISTRATOR"))
	{
		message.channel.send("You do not have permission to end this poll.");
		return false;
	}
	else
	{
		return true;
	}
}

function roll(args)
{
	if(args.length != 1 && args.length != 3)
	{
		return -1;
	}
	let arr = args[0].split("d");
	if(isNaN(arr[0]) || isNaN(arr[1]) || arr.length != 2)
	{
		return -1;
	}	
	let numDice = arr[0];
	let numSides = arr[1];
	if(numDice > 100 || numSides > 100)
	{
		return -2
	}
	let result = 1;
	for(var i = 0; i < numDice; i++)
	{
		result += Math.floor(Math.random() * numSides);
	}
	return result;
}
//reconnecting event, triggers when bot tries to reconnect to websocket
client.on("reconnecting", (error) =>
{
	//print to console that bot is attempting to reconnect
	console.log("Client disconnected, attempting to reconnect...");
});	

//resume event, triggers when bot reconnects to websocket
client.on("resume", (msg) =>
{
	//print reconnect message, and print to console that the bot has reconnected
	console.log(msg);
	console.log("Client reconnected.");
});	

//warn event, triggers when a warning triggers
client.on("warn", (w) =>
{
	//print the warning message to console
	console.warn(w);
});

//error event, triggers when an error occurs and the bot disconnects
client.on("error", (Error) =>
{
	//console.error(Error);
	//print to console that the bot has disconnected from the server, set the current voice channel to null
	console.log("Connection failed, logging out.");
	//client.destroy();
});	
//disconnect event, triggers when the bot disconnects from the server
client.on("disconnect", (err, code) =>
{
	//print to console that the client has disconnected, provides a reason and an error code
	console.log("--- Client disconnected from server with code: " + code + " for reason: " + err + " ---");
	//kill process
	process.exit(1);
});

//use the login token in the config file
client.login(config.token);