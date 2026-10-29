import {Collapse,Tag} from 'antd';
import {DATA_VERSION,MODEL_ID,sources} from '../../data/rules';
export function ModelNotes(){return <Collapse ghost items={[{key:'rules',label:'这些数字是怎么来的',children:<>
 <p><Tag>官方写的</Tag>角色五星最多 90 抽出，武器最多 80 抽出；歪了以后下次出金一定是 UP；武器定轨攒到 1 点命定值后，下次出金必是定轨武器。五星角色第 2 到 7 个返 10 星辉，第 8 个起返 25；四星角色分别是 2 和 5，第一次抽到不返。五星武器每次返 10，四星武器返 2。</p>
 <p><Tag>玩家推算的</Tag>软保底和捕获明光的算法来自 GGanalysis 的公开代码；这个算法里武器第 77 抽一定出金。出五星时如果本该出四星，四星会往后顺延。不会把官方写的综合概率直接当成每一抽的概率。</p>
 <p><Tag>这里的简化</Tag>歪到的四星，先按角色和武器各一半来分，再从当期 UP 以外的里面随机挑。没满命的四星，初始在 0 到 6 个之间随机。这不是你真实的账号。</p>
 <p>「捕获明光」默认从第 1 步算起，只是开局的假设。跑一百万次能让随机波动变小，但改不掉算法和你账号假设上的偏差。</p>
 <p>数据版本：{DATA_VERSION}，这期活动到 2026-11-03 结束。7.2 上线后不会自动更新，要重新核对规则。算法编号：{MODEL_ID}</p>
 <ul>{sources.map((url,i)=><li key={url}><a href={url} target="_blank" rel="noreferrer">官方公布的{['丝柯克池','爱可菲池','武器池'][i]}名单和规则</a></li>)}<li><a href="https://github.com/OneBST/GGanalysis/blob/5b146921c2844291548bf5621eb0d7ca79223d64/GGanalysis/games/genshin_impact/gacha_model.py" target="_blank" rel="noreferrer">玩家推算用的原始代码</a></li></ul>
 </>}]} />;}
