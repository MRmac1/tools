/**
 * file: 相册按日期分类
 *
 * createTime 2020年09月07日11:53:36
 * author qinglu
 */
import fs from 'fs'
import path from 'path'
import moment from 'moment'
import { ExifImage } from 'exif';

const PHOTO_SUFFIX = ['jpg', 'JPG', 'png']

async function* walk(dir) {
  for await (const d of await fs.promises.opendir(dir)) {
      const entry = path.join(dir, d.name);
      if (d.isDirectory()) yield* await walk(entry);
      else if (d.isFile()) yield entry;
  }
}

function getExifDate(file) {
  return new Promise((resolve) => {
    new ExifImage({ image : file }, function (error, exifData) {
      if (error) {
        return resolve({})
      } else {
        return resolve(exifData);
      }
    });
  })
}

const isExist = (path) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path)
  }
}

const photoClassify = async function (photoPath, during) {
  for await (const filePath of walk(photoPath)) {
    const pathArr = filePath.split('.')
    const suffix = pathArr[pathArr.length - 1]
    const timeFormat = during === 'month' ? 'YYYY-MM': 'YYYY'
    let fileCreatedTime;
    if (PHOTO_SUFFIX.includes(suffix)) {
      const { exif } = await getExifDate(filePath);
      if(exif?.CreateDate) {
        const originCreateDate = exif.CreateDate
        const originDate = originCreateDate.split(' ')[0].replace(/:/g, '-')
        fileCreatedTime = moment(originDate).format(timeFormat)
      } else {
        const fileStat = fs.statSync(filePath);
        console.log('fileCreatedTime has fileStat', fileStat.birthtimeMs);
        fileCreatedTime = moment(fileStat.birthtimeMs).format(timeFormat)
      }
    } else {
      // 非照片文件
      const fileStat = fs.statSync(filePath);
      fileCreatedTime = moment(fileStat.birthtimeMs).format(timeFormat)
    }

    const classifiedDir = path.join(photoPath, fileCreatedTime)

    isExist(classifiedDir)
    // 将照片移动对应的文件 filePath -> classifiedDir
    console.log(`copying photo ${filePath} to ${classifiedDir}`)
    const fileBaseName = path.basename(filePath)
    fs.copyFileSync(filePath, path.resolve(classifiedDir, fileBaseName))
  }
}

export default photoClassify