import MonitoInit from './init';
import {InitParm, TimeInfo, ViewIfo} from './data-type';
import Http from './report';
import {setShowLog} from './log-output';


class MonitoAction {
    private monitoInit: MonitoInit;

    constructor() {
        this.monitoInit = new MonitoInit();
    }

    init(parmas: InitParm): void {
        const {
            reques,
            monitoSwitch = true,
            showLog = false
        }: InitParm = parmas;
        if (monitoSwitch) {
            setShowLog(showLog)
            //埋点配置开关
            this.monitoInit.eventInit(parmas);
            Http.setRequestConfigs(reques);
        }

    }

    /**
     * @param {Object} params 数据处理
     */
    track(params: TimeInfo | ViewIfo): void {
        this.monitoInit.track(params);
    }
}

export default MonitoAction;
