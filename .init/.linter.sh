#!/bin/bash
cd /home/kavia/workspace/code-generation/travel-planner-pro-139250-139259/travel_planner_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

