import { APIGatewayProxyResult } from 'aws-lambda';

const allowedOrigins = process.env.ALLOWED_ORIGINS || '*';

export class CorsAPIGatewayProxyResult implements APIGatewayProxyResult {
  public statusCode: number;
  public headers: { [name: string]: string };
  public body: string;

  constructor(statusCode: number, body: any, headers?: { [name: string]: string }) {
    this.statusCode = statusCode;
    this.headers = headers || {};
    this.headers['Access-Control-Allow-Origin'] = allowedOrigins;
    this.headers['Access-Control-Allow-Credentials'] = 'true';
    this.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS';
    this.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Content-Length, X-Requested-With';
    this.body = JSON.stringify(body);
  }
}