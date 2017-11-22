'use strict';

module.exports = node => {

  const { identity } = node;

  node.use('CREATE_ALIAS', (req, res) => {

    //TODO get values from reqeust. If not exist then add, otherwise response already exists

    res.send(['let us create alias']);
  });

  node.createAlias = callback => {
    let neighbor = [
      ...node.router.getClosestContactsToKey(identity).entries()
    ].shift();

    node.send('CREATE_ALIAS', ['let us create alias', neighbor, callback]);
  }

};