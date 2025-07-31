# simsim-game

the Gameplay Description:

Concept and Objective
The game features the "up" emoji (👆) as the main player character and gift emojis (🎁) as the enemies. The primary objective is to move the player character to dodge the enemies while shooting them with laser pulses.
Gameplay Mechanics
Movement: The player emoji (👆) moves horizontally and will track the position of the player's finger anywhere on the screen. And can moves horizontally with the keyboard arrow keys.
Firing: Firing is automatic (auto-fire). As long as the player's finger is in contact with the screen to control movement, the player emoji will fire laser pulses continuously towards the top of the screen. Or fire while pressing the space bar on the keyboard
Enemies: Enemies (🎁) move downwards from the top of the screen. Their speed progressively increases over time, making the game more challenging.
Lives: The player starts with 5 lives (♥️).
User Interface (UI)
The game is played in a full-screen black window with a dedicated header at the top.
Header:
Left Side: Displays the player's collected points.
Center: Shows the letters collected from the phrase "(Happy Birthday to simsim)".
Right Side: Displays the player's remaining lives.
Destruction and Special Effects
Player Destruction: If the player emoji (👆) collides with an enemy (🎁), it will be destroyed. This triggers an explosion effect (💥), the player loses one life (-1♥️), a flicker effect occurs, and the game round continues. If the player's lives reach zero, the game ends immediately.
Enemy Destruction: When an enemy (🎁) is destroyed by a laser, it has a chance to drop a random emoji with a special effect. These dropped emojis disappear after the player collides with them. The drop probabilities and effects are as follows:
10% Chance (🍕🥯🍰🎂🧁🍭🍬🍩🍨🍉): Gives +5 points and an extra life.
15% Chance (😊😁👍🤣👌🤩😝😹😎🐣): Gives +15 points.
15% Chance (⭐🌞🌜❄️⛄⚡🌧️☄️🌡️⛱️): Gives +5 points and slows down all enemies on screen for 10 seconds.
10% Chance (✨🎉🪄🪅🕹️🪅🪁🎢🎈🪂): Gives +5 points and triples all collected points (x3) for 10 seconds. An "(x3)" icon appears below the score to indicate the multiplier is active.
15% Chance (🤝👋👏🤲💪✌️🤙🤛✊🙏): Gives +5 points. The player starts firing two projectiles, and this number increases by one with each collision with a similar emoji type, up to 20, with a slight spread.
15% Chance (📿🕯️🪔📗🕋🕌🌜☪️🤲🕊️): Gives +5 points and provides an invincibility shield for 10 seconds. A circle appears around the player emoji to indicate the shield is active.
20% Chance: Nothing drops.

Game Over and Special Events
Game Over: The game ends and a "Game Over" screen is displayed when the player loses their last life. The player's final score is shown.
Letter Collection: The letters of the phrase "Happy Birthday to simsim" will appear sequentially on the screen, one every 30 seconds. Collecting a letter grants +20 points, and it appears in its designated spot in the header. The sequence of letters repeats after the full phrase is completed.
Game Win: The game ends when the pretzel emoji (🥨) appears. This happens only after all letters of "Happy Birthday to simsim" have been successfully collected. Collecting the pretzel grants +100 points and completes the game, displaying a "You Win!" message.
