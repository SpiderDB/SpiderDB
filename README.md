![Banner](https://raw.githubusercontent.com/SpiderDB/SpiderDB/master/SpiderDB-GitHubHeader.png)

## SpiderDB
Welcome to SpiderDB, a NoSQL document store with query and rollback features. It utilizes the type safety of TypeScript with the power and simplicity of Node.js to create a developer-friendly, extensible NoSQL platform. 

*SpiderDB was made in fullfillment of the requirements for CS 609 - Database Management in the fall of 2016.*


## Table of Contents

* [**SpiderDB**](#spiderdb)
  * [Installation](#installation)
  * [Getting Started](#getting-started)
* [**Under the Hood**](#under-the-hood)
  * [Structure](#structure)
* [**Unit Tests**](#unit-tests)
* [**Credits**](#credits)
* [**License**](#license)


##Installation
There is currently no desktop executable for SpiderDB, so it must be built from source. Below is a platform-specific way of getting SpiderDB up an running.

####Linux
To install onLinux, execute the following commands in the terminal inside of the directory you wish to save SpiderDB
```
    $sudo apt-get install nodejs
    $sudo apt-get install npm 
    $npm install -g typescript
    $git clone https://github.com/SpiderDB/SpiderDB.git 
    $tsd install require --save
```

####Mac
 First, download and install [Node.js](https://nodejs.org/en/download/) then run the following terminal commands
 ```
$npm install npm --global
$npm install -g typescript
$git clone https://github.com/SpiderDB/SpiderDB.git 
$tsd install require --save
```

####Windows
 First, download and install [Node.js](https://nodejs.org/en/download/). Next, download the spider DB master branch files above and save them to the directory you wish to use SpiderDB. Open a Windows command prompt, navigating to the SpiderDB directory, and run the following commands
 ```
 > npm install -g typescript
 > npm install
 > tsc
 ```
 Navigate to the now created "compiled" folder inside of the SpiderDB root directory and run the following command to start SpiderDB
```
> node spiderDB.js
```

##Getting started

Core for the SpiderDB engine


##Under the Hood


####Structure

##Credits

[Ben Romano (benjaminromano)](https://github.com/benjaminRomano) - Developer

[Matthew York (MatthewYork)](https://github.com/matthewyork) - Developer

[PJ Sheini (pjsheini)](https://github.com/pjsheini) - Developer

##License
Copyright (c) 2012 The Board of Trustees of The University of Alabama
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions
are met:

 1. Redistributions of source code must retain the above copyright
    notice, this list of conditions and the following disclaimer.
 2. Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in the
    documentation and/or other materials provided with the distribution.
 3. Neither the name of the University nor the names of the contributors
    may be used to endorse or promote products derived from this software
    without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL
THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
OF THE POSSIBILITY OF SUCH DAMAGE.
