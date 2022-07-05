import {
  AnalyzeDocumentCommand,
  AnalyzeExpenseCommand,
  TextractClient,
} from '@aws-sdk/client-textract';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';

@Injectable()
export class S3Service {
  constructor(private configService: ConfigService) {}

  private readonly s3 = new S3({
    accessKeyId: this.configService.get('AWS_SES_ACCESS_KEY_ID'),
    secretAccessKey: this.configService.get('AWS_SES_SECRET_ACCESS_KEY'),
    region: 'eu-west-2',
  });
  private readonly textractClient = new TextractClient({
    credentials: {
      accessKeyId: this.configService.get('AWS_SES_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_SES_SECRET_ACCESS_KEY'),
    },
    region: 'eu-west-2',
  });
  private readonly bucketName = this.configService.get('AWS_BUCKET_NAME');

  public async loadFile(
    { originalname, buffer, mimetype },
    folderName: string,
  ): Promise<any> {
    const name = originalname.includes('.')
      ? originalname.split('.').slice(0, -1).join()
      : originalname;

    const params = {
      Bucket: this.bucketName,
      Key: `${folderName}/${Date.now()}-${name.replace(/\s/g, '-')}.${mimetype.split('/')[1]}`,
      Body: buffer,
    };
    let location = '';
    let key = '';

    try {
      const uploadHandler = this.s3.upload(params);
      const { Location, Key } = await uploadHandler.promise();
      location = Location;
      key = Key;
    } catch (e) {
      console.error(e);
      throw new HttpException('S3 ERROR', HttpStatus.BAD_REQUEST);
    }
    return {
      location,
      key,
    };
  }

  public async getFilesStream(key: string) {
    const params = {
      Bucket: this.bucketName,
      Key: key,
    };
    return this.s3.getObject(params).createReadStream();
  }

  public async textractFile(data: { key: string; link: string }) {
    const params = {
      Document: {
        S3Object: {
          Bucket: this.bucketName,
          Name: data.key,
        },
      },
      FeatureTypes: ['TABLES', 'FORMS'],
    };
    const aExpense = new AnalyzeDocumentCommand(params);
    const response = await this.textractClient.send(aExpense);
    const lines = response.Blocks.filter((b) => b.BlockType === 'LINE').map(
      (i) => i.Text,
    );
    return lines;
  }

  public async deleteFile(key: string): Promise<number> {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: key,
      };

      const head = await this.s3.headObject(params).promise();
      await this.s3.deleteObject(params).promise();

      return head.ContentLength;
    } catch (e) {
      console.error(e);
    }
  }

  public async deleteFolder(folder: string) {
    const listedObjects = await this.getFilesFromFolder(folder);

    if (listedObjects.Contents.length === 0) return;

    const Objects = listedObjects.Contents.reduce(
      (acc, item) => [...acc, { Key: item.Key }],
      [] as Array<{ Key: string }>,
    );

    const deleteParams = {
      Bucket: this.bucketName,
      Delete: { Objects },
    };

    await this.s3.deleteObjects(deleteParams).promise();

    if (listedObjects.IsTruncated) {
      await this.deleteFolder(folder);
    }
  }

  public async getFilesFromFolder(folder: string) {
    const listParams = {
      Bucket: this.bucketName,
      Prefix: folder,
    };

    return this.s3.listObjectsV2(listParams).promise();
  }
}
