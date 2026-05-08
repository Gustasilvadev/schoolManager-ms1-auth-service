const crypto = require('crypto');
const { getChannel } = require('../connection');

const publish = (routingKey, event) => {
  const channel = getChannel();
  if (!channel) {
    throw new Error('RabbitMQ não conectado');
  }
  const buffer = Buffer.from(JSON.stringify(event));
  return channel.publish(
    process.env.RABBITMQ_EXCHANGE,
    routingKey,
    buffer,
    { persistent: true, contentType: 'application/json' }
  );
};

const emitUserCreated = async (user, extraData = {}) => {
  const event = {
    event_id: crypto.randomUUID(),
    event_type: 'UserCreated',
    occurred_at: new Date().toISOString(),
    payload: {
      user_id: user.user_id,
      user_email: user.user_email,
      role: extraData.role,
      teacher_name: extraData.teacher_name || null,
      teacher_cpf: extraData.teacher_cpf || null
    }
  };
  publish('user.created', event);
};

const emitUserDeleted = async (userId) => {
  const event = {
    event_id: crypto.randomUUID(),
    event_type: 'UserDeleted',
    occurred_at: new Date().toISOString(),
    payload: { user_id: userId }
  };
  publish('user.deleted', event);
};

module.exports = { emitUserCreated, emitUserDeleted };
