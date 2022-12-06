import { Command } from 'commander'
import fs from 'fs'
import photoClassify from './photo-classify';

const program = new Command();

program
  .name('my-tools')
  .description('我的小工具集合')
  .version('0.1.0');

program.command('classify')
  .description('a tool used classify photos')
  .requiredOption('-p, --path <path>', 'the path of the photos')
  .option('-d, --during <string>', 'Classify by month or by year', 'month')
  .action(async (options) => {
    const { path: photoDirPath, during } = options
    console.log('during', during);
    if (!['month', 'year'].includes(during)) {
        console.log('during 参数错误, 只能传 month or year')
        return
    }
    try {
      const photoDirPathStat = fs.statSync(photoDirPath);
      if (photoDirPathStat.isDirectory()) {
        await photoClassify(photoDirPath, during)
        console.log('照片分类完成！');
      } else {
        console.log('请输入正确的文件夹路径');
      }
    } catch (error) {
      console.log('读取照片目录错误', error)
    }
  });

program.parse();
