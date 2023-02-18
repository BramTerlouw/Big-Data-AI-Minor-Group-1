<?php

$res = exec('python ./paddle-v5.py');

var_dump(json_decode($res));