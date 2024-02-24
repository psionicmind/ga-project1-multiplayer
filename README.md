# ga-project1
ga-project1

# Tower of Hanoi

![Single Player Game](https://github.com/psionicmind/ga-project1-multiplayer/blob/main/img/Images%20of%20your%20actual%20game1%20v1.png?raw=true)

![Main player with side by side player](https://github.com/psionicmind/ga-project1-multiplayer/blob/main/img/Images%20of%20your%20actual%20game2%20v1.png?raw=true)

# Inventor
Édouard Lucas

# Start Game Now!
[Let's GO!](https://ga-project1-multiplayer.vercel.app/)

# Games Description
Tower of Hanoi is a mathematical game which consist of three sticks and a number of disc of various diameters.  The game begins with all discs stacked with the biggest disc at the bottom of the stick to the smallest disc at the top of the stick.

# Tech Stack
JavaScript, HTML, CSS

# Rules
Game rules:
1. Only one disc may be moved at a time.
2. bigger disc cannot be stack on top of a smaller disc.

# Mathematic solution
This game can be solved in the optimal solution using iterative method, Recursive solution.

# Getting Started
The control keys on the keyboard are : 
1) keypad number 1
2) keypad number 2
3) keypad number 3

# Game Logic
- initial keypress of any control keys will be indicated as the origin tower you want to move FROM.
- the next keypress of any control keys will be indicated as the destinated tower you want to move TO.
  Example:
        moving the top disc from tower 1 to tower 3 will involve pressing "1" first and followed by "3".
- moving a bigger disc to another tower with a smaller disc will prompt an error message at the bottom of the towers.
- once you start pressing the first control keys, the timer will start and once you win, the timer will stop.
- pressing on the reset button resets the game, with all the discs going back to tower 1, showing initial state. 
   timer and steps will be reset
- if origin tower is empty, pressing the tower number will prompt an error message.

# Win Lose
To win, you need to transfer all disc from tower 1 to any other tower, with the disc stacked smallest at the very top to the largest disc at the very bottom.
There is no losing, timer keeps running.  User can reset to restart the game.

# Planned future enhancements (icebox items)
- beautify the user interface
- enable reverse move
- to solve user current struck position, with reverse move
- to be able to use other people github code for future enhancement 
(example: using beautify stylesheet css files, how to import, how to apply)

# Challenges
1) using reference code ethically
2) explaining a difficult algorithm

# Reference
[1] Tower of Hanoi Picture taken from https://www.tutorialspoint.com/data_structures_algorithms/tower_of_hanoi.htm, located in project proposal document.

[2] stopwatch function by Ahmed Yasser, https://www.educative.io/answers/how-to-create-a-stopwatch-in-javascript 