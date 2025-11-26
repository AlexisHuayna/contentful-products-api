import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';


@Injectable()
export class ProductSyncService {
    constructor(

    ) { }

    @Cron(CronExpression.EVERY_10_MINUTES)
    async syncProducts() {
        console.log('EXECUTING PRODUCT SYNC');
    }
}
