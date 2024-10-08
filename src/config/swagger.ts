import express, { Router } from "express";
import listEndpoints from "express-list-endpoints";

const generateSwaggerSpec = (app: express.Application | Router) => {
  const endpoints = listEndpoints(app);

  const paths = endpoints.reduce((acc: any, endpoint) => {
    const { path, methods } = endpoint;

    acc[path] = methods.reduce((methodAcc: any, method: string) => {
      methodAcc[method.toLowerCase()] = {
        tags: [path.split("/")[1] || "default"],
        summary: `${method} ${path}`
      };

      if (["post", "put", "patch"].includes(method.toLowerCase())) {
        methodAcc[method.toLowerCase()].requestBody = {
          content: {
            "application/json": {
              schema: {
                type: "object",
              },
            },
          },
          required: true,
        };
      }
      return methodAcc;
    }, {});
    return acc;
  }, {});

  return {
    openapi: "3.0.0",
    info: {
      title: "API Documentation",
      version: "1.0.0",
      description: "API Documentation generated by Swagger",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3333}`,
      },
    ],
    paths,
  };
};

export default generateSwaggerSpec;
