/* eslint-disable max-len */
module.exports = {
  async up(db) {
    const User = db.collection('users');
    const user = {
      'login': 'test@test.com',
      'firstName': 'FirstName',
      'lastName': 'LastName',
      'password': 'BO7LxWQPb/iEtXtVUvNvj1d5SyoboFHZNPlydKkaIFD98ar71RieoigifumaDyayqo+8Q5jzRUh0eXo3JaL/Qy1shXV4la53BicSWHpJxX7Uu96ZBmHiCv/eVI2cEh84rzKd/orGycqufuajAZroYLj4inwM0nOyXBekVy7H1hSE8QLJdipC2fKbDJ6edIJLF4+DKyscIx2uXlIrPpa0dv0c6XbgHmuDA8JyTI3wB7ncepc+fmq7OuM2pWe3TYm3uMg8VPFxMABPaJ/e8/5uFp0HwAMUTQPiBkbp4tE/a3m0vA9owbyzjCvzEu3TKe2ErwZGwEGntZCH91vfGoQ3DH4LbinGYSaUnMNYsyVBjNjhbVtry1Q27Jc3koZA8yrijUmzE4374br57266A4ZPdhMyvKOgTzmA+qRYJhhTfzCBVkQGLm65D8sH2dq3tkoOBmc3dja81nnxk8Ej8Wk3rvBeYU47e5BbBwGqkwSW1tJhOqOhU9LHD/a/aq5H7/XEPrw5k14cYbRDP8qc4IPBd/sEh00s4qjVf1PB76iAZkkZ+D2hiv+aq8IENbihmW0+3FgSa+6bykClQczWMYZOY0a4qSuesbZl4lz8gF/iIX3AoX5nJrsrbewNfF5vVQLql8DU77S5ELoJ8kQPtby5TjYdapSFvm6h/7+OiWDVWoE=',
      'passwordSalt': 'IV//0oejBChsRB9pTxx0BfEbI3LiBC2CLiuzWMOrOdD3dBNBdKpYLb+yDFuBs0z4Kpt+XY1WstAU6vnNRjvj/fM5mOYYY0oq1w7f9Q9ENw8L2qg0bDG1dmU4yNaTbAcUDoZbAPR89r4rBH9n23eatt69/J52uZ9zEjSiPK6C7ZU='
    };
    await User.insert(user);
  },

  async down(db) {
    const User = db.collection('users');
    await User.deleteMany({login: 'test@test.com'});
  }
};
