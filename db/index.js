const fs = require("fs");


class Database {
    constructor(local = false) {
        this.local = local
    }

    _path(network) {
        if (this.local) {
            return `./db/local.${network}.json`
        }
        return `./db/${network}.json`
    }

    async read(network, path) {
        if (fs.existsSync(this._path(network))) {
            let file = fs.readFileSync(this._path(network))
            file = JSON.parse(file);
            return file[path];
        }
        return null;
    }

    async write(network, path, address) {
        let file = {}
        console.log(fs.existsSync(this._path(network)))
        if (fs.existsSync(this._path(network))) {
            file = await fs.readFileSync(this._path(network))
            file = JSON.parse(file);
        }
        file[path] = address;
        console.log(file)
        let data = JSON.stringify(file);
        await fs.writeFileSync(this._path(network), data)
    }
}

module.exports = {Database: Database}
