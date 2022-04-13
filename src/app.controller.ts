import { Controller, Get } from '@nestjs/common';
import * as fs from 'fs'

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    const rev = fs.readFileSync('.git/HEAD').toString().trim();
    const commitHash = fs.readFileSync('.git/' + rev.substring(5)).toString().trim()

    return `Receipt Hub API: Running ${process.env.NODE_ENV} version, last commit: ${commitHash}`
  }
}
