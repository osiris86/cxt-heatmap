# Start the first process
node dist/main.js &

# Start the second process
node dist/worker.js &

# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit $?