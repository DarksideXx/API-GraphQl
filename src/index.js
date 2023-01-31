const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');

// Definir as regras de verificação de senha
const minSize = 8;
const minUppercase = 1;
const minLowercase = 1;
const minDigit = 1;
const minSpecialChars = 1;
const noRepeted = 0;

// Definir schema do GraphQL
const typeDefs = gql`
type Verify {
success: Boolean
noMatch: [String]
}
    type Query {
        verifyPassword(password: String!, rules: [Rule]): Verify
    }

    input Rule {
        rule: String!
        value: Int!
    }
`;

// Definir os resolvedores para o  schema
const resolvers = {
    Query: {
        verifyPassword: (root, { password, rules }) => {
            let noMatch = [];
            let verify = true;

            // Verifica o tamanho mínimo
            if (rules.find(r => r.rule === 'minSize' && password.length < r.value)) {
                noMatch.push('minSize');
                verify = false;
            }


            // Verifica o mínimo de letras maiúsculas
            let uppercaseCount = 0;
            for (let i = 0; i < password.length; i++) {
                if (password[i] === password[i].toUpperCase() && isNaN(password[i])) {
                    uppercaseCount++;
                }
            }
            if (rules.find(r => r.rule === 'minUppercase' && uppercaseCount < r.value)) {
                noMatch.push('minUppercase');
                verify = false;
            }

            // Verifica o mínimo de letras minúsculas
            let lowercaseCount = 0;
            for (let i = 0; i < password.length; i++) {
                if (password[i] === password[i].toLowerCase() && isNaN(password[i])) {
                    lowercaseCount++;
                }
            }
            if (rules.find(r => r.rule === 'minLowercase' && lowercaseCount < r.value)) {
                noMatch.push('minLowercase');
                verify = false;
            }


            // Verifica os dígitos mínimos
            let digitCount = 0;
            for (let i = 0; i < password.length; i++) {
                if (!isNaN(password[i])) {
                    digitCount++;
                }
            }
            if (rules.find(r => r.rule === 'minDigit' && digitCount < r.value)) {
                noMatch.push('minDigit');
                verify = false;
            }
            // Verifica o mínimo de caracteres especiais
            let specialCharsCount = 0;
            const specialChars = "!@#$%^&*()-+\/{}[]";
            for (let i = 0; i < password.length; i++) {
                if (specialChars.includes(password[i])) {
                    specialCharsCount++;
                }
            }
            if (rules.find(r => r.rule === 'minSpecialChars' && specialCharsCount < r.value)) {
                noMatch.push('minSpecialChars');
                verify = false;
            }


            // Verifica nenhum caractere repetido
            for (let i = 0; i < password.length - 1; i++) {
                if (password[i] === password[i + 1]) {
                    noMatch.push('noRepeted');
                    verify = false;
                    break;
                }
            }

            return { verify, noMatch };
        }
    }
};

const start = async () => {
    // Criando o servidor Apollo
    const server = new ApolloServer({ typeDefs, resolvers });
    await server.start();
    console.log(`Server started at ${server.graphqlPath}`);

    // Criando o aplicativo Express
    const app = express();


    // Aplicando o servidor Apollo ao aplicativo Express
    server.applyMiddleware({ app });

    app.listen({ port: 3000 }, () => {
        console.log(`Server ready at http://localhost:3000${server.graphqlPath}`);
    });
}
start()






