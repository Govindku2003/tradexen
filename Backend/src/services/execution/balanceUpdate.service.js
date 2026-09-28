const updateBalanceAfterBuy = ({
  availableBalance,
  orderValue,
}) => {
  if (availableBalance < orderValue) {
    throw new Error(
      "Insufficient balance for BUY order"
    );
  }

  return {
    previousBalance: availableBalance,
    balanceChange: -orderValue,
    newBalance:
      availableBalance - orderValue,
  };
};

const updateBalanceAfterSell = ({
  availableBalance,
  orderValue,
}) => {
  if (orderValue <= 0) {
    throw new Error(
      "Order value must be positive"
    );
  }

  return {
    previousBalance: availableBalance,
    balanceChange: orderValue,
    newBalance:
      availableBalance + orderValue,
  };
};

export {
  updateBalanceAfterBuy,
  updateBalanceAfterSell,
};