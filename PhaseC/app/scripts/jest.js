(function(){

  const jest = require("jest");
  const config = require("../jest.config");
  const path = require("path");

  jest
    .runCLI(config, [path.resolve(__dirname, '..')])
    .then((success) => {
      process.exit(0);
    })
    .catch((failure) => {
      process.exit(1);
    });

}());