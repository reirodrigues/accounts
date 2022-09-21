import chalk from "chalk";
import inquirer from "inquirer";
import fs from "fs";

operations();

function operations() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "action",
        message: "O que você deseja fazer?",
        choices: [
          "Criar Conta",
          "Consultar Saldo",
          "Depositar",
          "Sacar",
          "Sair",
        ],
      },
    ])
    .then((answers) => {
      const action = answers.action;

      if (action === "Criar Conta") {
        createAccount();
      } else if (action === "Consultar Saldo") {
        getAccountBalance();
      } else if (action === "Depositar") {
        deposit();
      } else if (action === "Sacar") {
        withdraw();
      } else if (action === "Sair") {
        console.log(chalk.bgBlue("Obigado por usar o Accounts"));
        process.exit();
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

function createAccount() {
  console.log(chalk.bgGreen("Parabéns por escolher o nosso banco"));
  console.log(chalk.green("Defina as opções da sua conta a seguir"));

  buildAccount();
}

function buildAccount() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "nameAccount",
        message: "Qual o nome deseja para sua conta ?",
      },
    ])
    .then((answers) => {
      const nameAccount = answers.nameAccount;

      console.info(nameAccount);

      if (!fs.existsSync("accounts")) {
        fs.mkdirSync("accounts", (err) => {
          if (err) {
            console.log(err);
            return;
          }
        });
      }

      if (fs.existsSync(`accounts/${nameAccount}.JSON`)) {
        console.log(
          chalk.bgRed("Esse nome de conta já existe, informe outro nome:")
        );
        buildAccount();
        return;
      }

      fs.writeFileSync(
        `accounts/${nameAccount}.JSON`,
        '{ "balance": 0 }',
        (err) => {
          console.log(err);
        }
      );

      console.log(chalk.green(`Parabéns ${nameAccount} sua conta foi criada!`));
      operations();
    })
    .catch((err) => {
      console.log(err);
    });
}

function getAccountBalance() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "nameAccount",
        message: "Qual o nome da conta você deseja conusltar ?",
      },
    ])
    .then((answers) => {
      if (!fs.existsSync(`accounts/${answers.nameAccount}.JSON`)) {
        console.log(chalk.bgRed("Essa conta não existe, informe outro nome:"));
        consult();
        return;
      }

      const accountData = getAccount(answers.nameAccount);

      console.log(
        chalk.bgBlue(`O saldo em sua conta é: R$${accountData.balance}`)
      );
      operations();
    })
    .catch((err) => {
      console.log(err);
    });
}

function deposit() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "nameAccount",
        message: "Qual o nome da conta você deseja depositar ?",
      },
    ])
    .then((answers) => {
      const nameAccount = answers.nameAccount;
      if (!fs.existsSync(`accounts/${nameAccount}.JSON`)) {
        console.log(chalk.bgRed("Essa conta não existe, informe outro nome:"));
        deposit();
        return;
      }

      inquirer
        .prompt([
          {
            type: "input",
            name: "amout",
            message: "Qual o valor deseja depositar ?",
          },
        ])
        .then((answers) => {
          const amout = answers.amout;

          addAmout(nameAccount, amout);
          operations();
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
}

function addAmout(nameAccount, amout) {
  const accountData = getAccount(nameAccount);

  if (!amout) {
    console.log(chalk.bgRed("Algo deu errado, tente novamente!"));
    return;
  }

  accountData.balance += parseFloat(amout);
  console.log(
    chalk.bgGreen(`O saldo de R$${amout} foi depositado em sua conta.`)
  );

  fs.writeFileSync(
    `accounts/${nameAccount}.JSON`,
    JSON.stringify(accountData),
    (err) => {
      console.log(err);
    }
  );
}

function getAccount(nameAccount) {
  const accountJson = fs.readFileSync(`accounts/${nameAccount}.JSON`, {
    encoding: "utf8",
    flag: "r",
  });
  return JSON.parse(accountJson);
}

function withdraw() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "accountName",
        message: "Qual o nome da sua conta?",
      },
    ])
    .then((answers) => {
      const nameAccount = answers.accountName;

      if (!fs.existsSync(`accounts/${nameAccount}.JSON`)) {
        console.log(chalk.bgRed("Essa conta não existe, informe outro nome:"));
        withdraw();
        return;
      }

      inquirer
        .prompt([
          {
            type: "input",
            name: "amout",
            message: "Quanto você deseja sacar ?",
          },
        ])
        .then((answers) => {
          const amout = answers.amout;

          removeAmout(nameAccount, amout);
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
}

function removeAmout(nameAccount, amout) {
  const accountData = getAccount(nameAccount);

  const amoutWithdraw = parseInt(amout);

  if (!amout) {
    console.log(chalk.bgRed("Ocorreu um erro, tente novamente!"));
    operations();
    return;
  }

  if (amoutWithdraw > accountData.balance) {
    console.log(chalk.bgRed("Saldo insulficiente!"));
    operations();
    return;
  }

  accountData.balance -= amoutWithdraw;

  fs.writeFileSync(
    `accounts/${nameAccount}.JSON`,
    JSON.stringify(accountData),
    (err) => {
      console.log(err);
    }
  );

  console.log(chalk.bgGreen(`O saque de R$${amoutWithdraw} foi efetuado!`));
  console.log(chalk.bgGreen(`Seu novo saldo é de R$${accountData.balance}`));

  operations();
}
