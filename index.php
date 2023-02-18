<?php

$res = exec('python .\python\ObjectDetectionV8.py');

var_dump(json_decode($res));