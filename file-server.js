const express = require('express');
const session = require('express-session');
const fileStore = require('session-file-store')(session);
const app = express();
require('dotenv').config();
const fs = require('fs');
const path = require('path');