# To-Do FrontEnd

This web app uses ReactJS in conjunction with the Cloudscape component library.

Please consult the respective documentation as you extend the app.

Make sure to run `yarn install` to pull the dependencies.

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Runs test runner as defined in `jest.config.js`.  See Jest documentation for options to configure the testing

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## CDK Deployment

If you want to deploy without using CI/CD workflows, you can move the `build` folder to the `cdk/frontend` folder by running:
```bash
mkdir /cdk/frontend && cp build /cdk/frontend
```
And then follow the instrucitons in the `cdk` folder README file.

## Learn More
To learn React, check out the [React documentation](https://reactjs.org/).

To learn more about Cloudscape, see the [Cloudscape docs](https://cloudscape.design/)
