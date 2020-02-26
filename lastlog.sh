#!/usr/bin/env bash

START=`grep -n 'Starting update at' logs/app.log | tail -n1 | cut -d':' -f1`
# echo $START;
LEN=`wc -l logs/app.log | awk '{print $1}'`
# echo $LEN;
OFFSET=2;
DIFF=`expr $LEN - $START + $OFFSET`
# echo $DIFF
tail -n$DIFF logs/app.log
