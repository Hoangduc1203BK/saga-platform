# run kafka docker:
cd /opt/kafka/
# Create topic:
./bin/kafka-topics.sh --create --zookeeper zookeeper:2181 --replication-factor 1 --partitions 1 --topic <topic_name>

# List topic:
./bin/kafka-topics.sh --list --zookeeper zookeeper:2181 

# Add message to topic:
echo "Hello hmduc from kafka" | ./bin/kafka-console-producer.sh --broker-list localhost:9092 --topic <topic_name> > /dev/null

# All message in topic:
./bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic <topic_name> --from-beginning

# Delete message from topic:
./bin/kafka-topics.sh --delete --zookeeper zookeeper:2181 --topic <topic_name>
