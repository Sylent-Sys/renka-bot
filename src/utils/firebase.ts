import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { randomUUID } from 'crypto'
import fs from 'fs'
import pathImport from 'path'
export class Firebase {
  static db = getFirestore()
  static storage = getStorage()
  static async uploadFile(path: string, file: string) {
    let uuid = randomUUID()
    try {
      let dest = `${path}/${uuid}-${pathImport.basename(file)}`
      await Firebase.storage.bucket().upload(file, {
        destination: dest,
      })
      await this.addData(path, uuid, {
        dest: dest,
      })
      fs.unlinkSync(file)
      return {
        uuid: uuid,
        message: 'File uploaded successfully',
      }
    } catch (e) {
      console.log(e)
    }
  }
  static async getDownloadUrl(path: string, uuid: string) {
    const dest = await this.getData(path, uuid)
    const url = await this.storage
      .bucket()
      .file(dest.data()?.dest)
      .getSignedUrl({
        action: 'read',
        expires: Date.now() + 1000 * 60 * 60 * 24,
      })
    return {
      url: url[0],
    }
  }
  static async deleteFile(path: string, uuid: string) {
    const dest = await this.getData(path, uuid)
    await this.deleteData(path, uuid)
    return await this.storage.bucket().file(dest.data()?.dest).delete()
  }
  static async addData(path: string, uuid: string, data: any) {
    return await this.db.collection(path).doc(uuid).set(data)
  }
  static async getData(path: string, uuid: string) {
    return await this.db.collection(path).doc(uuid).get()
  }
  static async deleteData(path: string, uuid: string) {
    return await this.db.collection(path).doc(uuid).delete()
  }
}
