import * as AWS from 'aws-sdk';
import p from 'phin';
import { Todo } from '../../lambda/Todo';
import { stackName } from '../../bin/todo-api';

import { ApiGatewayEndpointStackOutput } from '../../lib/todo-api-stack';
// Get apiEndpoint from stack outputs using aws-sdk

let apiEndpoint = process.env.API_ENDPOINT;

beforeAll(async () => {
  if (!apiEndpoint) {
    const cloudformationClient = new AWS.CloudFormation();
    const stack = await cloudformationClient.describeStacks({ StackName: stackName }).promise();
    apiEndpoint = stack.Stacks![0].Outputs!.find((o) => o.OutputKey === ApiGatewayEndpointStackOutput)!.OutputValue! + '/api';
  }
});

describe('Happy todos management', () => {
  test('should be able to run CRUD ops', async () => {
    const getAllResponse = await p({ url: apiEndpoint + '/todos', parse: 'json', method: 'GET' });
    let todos = getAllResponse.body as Todo[];
    expect(getAllResponse.statusCode).toBe(200);

    const initialCount = todos.length;

    const initialTitle = 'My first todo';
    const initialDescription = 'My first todo description';
    // Create a todo
    console.log('Creating a todo');
    const createResponse = await p({
      url: `${apiEndpoint}/todos`,
      method: 'POST',
      parse: 'json',
      data: {
        title: initialTitle,
        description: initialDescription,
        completed: false,
      },
    });

    await p({
      url: `${apiEndpoint}/todos`,
      method: 'POST',
      parse: 'json',
      data: {
        title: initialTitle + '-2',
        description: initialDescription + '-2',
        completed: false,
      },
    });
    expect(createResponse.statusCode).toBe(201);
    const initialTodo = createResponse.body as Todo;
    expect(initialTodo.title).toBe(initialTitle);

    // Get the todo
    console.log('Getting the todo');
    const getResponse = await p({
      url: `${apiEndpoint}/todos/${initialTodo.id}`,
      method: 'GET',
    });

    expect(getResponse.statusCode).toBe(200);
    expect(initialTodo.title).toBe(initialTitle);

    // Update the todo
    console.log('Updating the todo');
    const updatedTitle = 'My updated todo';
    const updatedDescription = 'My updated todo description';
    const updateResponse = await p({
      url: `${apiEndpoint}/todos/${initialTodo.id}`,
      method: 'PUT',
      parse: 'json',
      data: {
        title: updatedTitle,
        description: updatedDescription,
        completed: true,
      },
    });

    expect(updateResponse.statusCode).toBe(200);
    const updatedTodo = updateResponse.body as Todo;
    expect(updatedTodo.title).toBe(updatedTitle);

    // Get the todos
    console.log('Getting the todos');

    const getAllResponse_2 = await p({ url: apiEndpoint + '/todos', parse: 'json', method: 'GET' });
    todos = getAllResponse_2.body as Todo[];
    expect(getAllResponse.statusCode).toBe(200);
    expect(todos.length).toBe(initialCount + 2);

    // Delete the todo
    console.log('Deleting the todo');
    const deleteResponse = await p({
      url: `${apiEndpoint}/todos/${initialTodo.id}`,
      method: 'DELETE',
    });
    expect(deleteResponse.statusCode).toBe(204);

    // Get the todos 2
    console.log('Getting the todos 2');
    const getAllResponseAfterDelete = await p({ url: apiEndpoint + '/todos', parse: 'json', method: 'GET' });
    todos = getAllResponseAfterDelete.body as Todo[];
    expect(getAllResponseAfterDelete.statusCode).toBe(200);
    expect(todos.length).toBe(initialCount + 1);
  }, 30000);
});
