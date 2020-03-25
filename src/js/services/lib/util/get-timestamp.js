function getTimestamp() {
  const time = new Date().getTime();

  // eslint-disable-next-line curly
  while (time === new Date().getTime());

  return new Date().getTime();
}

export default getTimestamp;
