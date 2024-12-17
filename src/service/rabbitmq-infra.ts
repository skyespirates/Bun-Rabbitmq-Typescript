import { config } from 'dotenv';
config({ path: '../../.env' });
import amqp from 'amqplib';
import { handleError, Logger } from '../helper';

type MessagePayload = Record<string, unknown>;

const RABBITMQ_URL = process.env.RABBITMQ_URL;
if (!RABBITMQ_URL) {
    throw new Error("Environment variable RABBITMQ_URL is not set.");
}


// RabbitMQ connection setup
export const connectRabbitMQ = async (qName: string): Promise<amqp.Channel> => {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        await channel.assertExchange('myapp-rabbitmq', 'direct', { durable: true });
        Logger.info(`Connected to RabbitMQ and listening on queue: ${qName}`);
        return channel;
    } catch (error) {
        handleError('RabbitMQ Connection', error);
        throw error;
    }
};

// Generic message handler
export const processMessage = async (
    channel: amqp.Channel,
    msg: amqp.Message | null,
    handler: (payload: MessagePayload) => Promise<void>
): Promise<void> => {
    if (!msg) return;
    try {
        const payload: MessagePayload = JSON.parse(msg.content.toString());
        console.log('Received message:', payload);
        await handler(payload);
        channel.ack(msg);
    } catch (error) {
        handleError('Message Processing', error);
    }
};