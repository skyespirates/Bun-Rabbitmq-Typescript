
import { handleError } from "../helper";
import { connectRabbitMQ, processMessage } from "../service/rabbitmq-infra";

type MessagePayload = Record<string, unknown>;

// Generalized function to listen to RabbitMQ queue
export const listeningQueue = async (
    qName: string,
    receiveHandler: (payload: MessagePayload) => Promise<void>
  ): Promise<void> => {
    try {
      const channel = await connectRabbitMQ(qName);

      const q = await channel.assertQueue(qName, { durable: true });
      await channel.bindQueue(q.queue, 'myapp-rabbitmq', qName);

      channel.consume(
        q.queue,
        async (msg) => await processMessage(channel, msg, receiveHandler),
        { noAck: false }
      );
    } catch (error) {
      handleError('Queue Listener', error);
    }
  };
