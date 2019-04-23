import { Before, After, Path, Controller } from '../../src/index';

@Path('/index')
export default class Index extends Controller {
    index() {
        this.ctx.body = '这里是首页';
    }

    @Before(function before() {
        console.log('before', this.req.path);
        // return false;
    })
    @Path('/test/:name', '/test2')
    test(name: string) {
        console.log('......', name);
        this.ctx.body = `这里是测试页面，地址 ${this.req.path}`;
    }

    /* eslint-disable class-methods-use-this */
    // @Before()
    before() {
        console.log(123456);
    }

    @After()
    after() {
        console.log('after');
    }
}