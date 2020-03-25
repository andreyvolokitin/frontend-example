function isInt(value) {
  return (
    !Number.isNaN(value) &&
    // eslint-disable-next-line eqeqeq
    parseInt(Number(value), 10) == value &&
    !Number.isNaN(parseInt(value, 10))
  );
}

export default isInt;
