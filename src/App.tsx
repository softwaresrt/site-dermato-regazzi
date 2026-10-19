import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, CalendarDays, Check, ChevronDown, ChevronLeft, CircleCheck, Clock3, MapPin, Menu, MousePointer2, Plus, Send, ShieldCheck, X } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import Scene3D from './Scene3D';
import { useExperience } from './store';

gsap.registerPlugin(ScrollTrigger);

const WHATSAPP = '5521967811873';
const ADDRESS = 'Av. João Cabral de Mello Neto, 850, Bloco 2, Sala 816, Península, Barra da Tijuca, Rio de Janeiro - RJ';
const INSTAGRAM = 'https://www.instagram.com/regazzidermatologia/';
const waLink = (message: string) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`;
const agendaText = 'Olá! Conheci a Regazzi Dermatologia pelo site e gostaria de agendar uma avaliação dermatológica.';
const treatmentCategories = ['Todos', 'Facial', 'Pele', 'Capilar', 'Clínica'] as const;
type Category = typeof treatmentCategories[number];

interface Treatment {
  name: string;
  category: Exclude<Category, 'Todos'>;
  short: string;
  detail: string;
  assessment: string;
  illustration: string;
  label: string;
}
const treatments: Treatment[] = [
  { name: 'Toxina botulínica', category:'Facial', short:'Expressão e movimento, com olhar individualizado.', detail:'Procedimento injetável que pode ser considerado em situações específicas após avaliação da musculatura facial, do histórico e das expectativas.', assessment:'A indicação, a técnica, os cuidados e os resultados possíveis são discutidos individualmente em consulta.', illustration:'lines', label:'01' },
  { name: 'Bioestimuladores de colágeno', category:'Facial', short:'Uma abordagem para a qualidade da pele.', detail:'Tratamentos injetáveis que podem estimular processos naturais de produção de colágeno, conforme a avaliação médica.', assessment:'O tipo de produto, o plano terapêutico e as possíveis contraindicações dependem de avaliação presencial.', illustration:'rings', label:'02' },
  { name: 'Laser dermatológico', category:'Pele', short:'Tecnologia a serviço de diferentes necessidades.', detail:'Recursos de laser com usos variados na dermatologia, selecionados de acordo com a condição clínica e o fototipo.', assessment:'O equipamento e os parâmetros são definidos pela médica após exame da pele.', illustration:'laser', label:'03' },
  { name: 'Ácido hialurônico', category:'Facial', short:'Equilíbrio de proporções e individualidade.', detail:'Procedimentos com preenchedores podem ser avaliados quando houver indicação clínica, com atenção à anatomia e à segurança.', assessment:'A necessidade, a região e as limitações do procedimento são avaliadas caso a caso.', illustration:'drop', label:'04' },
  { name: 'Melasma e manchas', category:'Pele', short:'O cuidado começa por entender a sua pele.', detail:'Investigação dermatológica e orientações para diferentes tipos de manchas, incluindo fotoproteção e opções terapêuticas individualizadas.', assessment:'Nem toda mancha é melasma: o diagnóstico depende de avaliação médica.', illustration:'texture', label:'05' },
  { name: 'Queda de cabelo', category:'Capilar', short:'Investigação, diagnóstico e acompanhamento.', detail:'Avaliação de queixas capilares, couro cabeludo e possíveis fatores associados, com abordagem conforme o diagnóstico.', assessment:'A queda de cabelo tem múltiplas causas e não deve ser tratada sem investigação.', illustration:'strands', label:'06' },
  { name: 'Microagulhamento robótico', category:'Pele', short:'Precisão em protocolos escolhidos para cada pele.', detail:'Tecnologia que pode integrar protocolos dermatológicos específicos, conforme as necessidades e condições da pele.', assessment:'A indicação e os cuidados posteriores exigem consulta profissional.', illustration:'grid', label:'07' },
  { name: 'Ultrassom microfocado', category:'Facial', short:'Tecnologia de ultrassom, com indicação criteriosa.', detail:'O ultrassom microfocado, incluindo tecnologia LinearZ quando indicada, pode ser considerado dentro de planos médicos individualizados.', assessment:'A adequação do procedimento depende das características e contraindicações de cada pessoa.', illustration:'wave', label:'08' },
  { name: 'Acne e saúde da pele', category:'Clínica', short:'Cuidado dermatológico em cada fase da vida.', detail:'Avaliação médica de acne e outras condições de pele, com escolhas terapêuticas de acordo com gravidade, histórico e necessidades.', assessment:'O tratamento deve ser orientado após diagnóstico e acompanhamento.', illustration:'cells', label:'09' },
  { name: 'Dermatoscopia digital', category:'Clínica', short:'Atenção aos sinais que a pele apresenta.', detail:'Exame complementar de lesões e pintas, integrado à avaliação dermatológica e ao rastreamento de câncer de pele quando indicado.', assessment:'O exame não substitui a consulta nem permite diagnóstico pelo site.', illustration:'scope', label:'10' },
];

interface Zone { id: string; title: string; detail: string; examples: string; }
const zones: Zone[] = [
  {id:'testa',title:'Testa',detail:'A expressão facial é única. O movimento, a anatomia e a saúde da pele são avaliados com atenção.',examples:'Expressão facial · Toxina botulínica'},
  {id:'glabela',title:'Entre as sobrancelhas',detail:'Uma região de expressão que merece análise cuidadosa do movimento e da musculatura.',examples:'Avaliação da mímica · Toxina botulínica'},
  {id:'olhos',title:'Região dos olhos',detail:'A pele delicada ao redor dos olhos pode exigir orientações e abordagens específicas.',examples:'Qualidade da pele · Avaliação dermatológica'},
  {id:'maças',title:'Maçãs do rosto',detail:'Estrutura, textura e qualidade cutânea entram na conversa quando o objetivo é cuidar do rosto como um todo.',examples:'Bioestimuladores · Ácido hialurônico'},
  {id:'nariz',title:'Nariz',detail:'A anatomia e eventuais queixas da pele precisam ser examinadas antes de qualquer conduta.',examples:'Saúde da pele · Avaliação individual'},
  {id:'labios',title:'Lábios',detail:'Um olhar atento às particularidades dessa região, respeitando sua individualidade.',examples:'Cuidados dermatológicos · Ácido hialurônico'},
  {id:'mandibula',title:'Linha mandibular',detail:'A avaliação considera características da pele, proporções e expectativas com naturalidade.',examples:'Ultrassom microfocado · Bioestimuladores'},
  {id:'pescoco',title:'Pescoço',detail:'Uma região frequentemente esquecida na rotina, mas importante no cuidado dermatológico.',examples:'Fotoproteção · Qualidade da pele'},
];

const faqs = [
  {question:'Como funciona a primeira consulta?',answer:'A consulta começa com uma conversa sobre suas queixas, seu histórico e suas expectativas, seguida da avaliação médica. Quando necessário, podem ser discutidos exames e possibilidades de acompanhamento.'},
  {question:'Os procedimentos têm tempo de recuperação?',answer:'Depende do procedimento e das características de cada pessoa. Tempo de recuperação, cuidados e possíveis efeitos adversos são explicados antes de qualquer indicação.'},
  {question:'Como saber qual tratamento é indicado?',answer:'A indicação depende do diagnóstico e da avaliação individual. As informações deste site são educativas e não substituem a consulta com uma dermatologista.'},
  {question:'A clínica atende dermatologia clínica?',answer:'Sim. A atuação informada inclui dermatologia clínica, cirúrgica e estética, além de dermatoscopia e avaliação de condições como acne, melasma e queda capilar.'},
  {question:'Como posso consultar valores e formas de pagamento?',answer:'Entre em contato pelo WhatsApp da clínica para receber informações sobre consultas, disponibilidade e condições diretamente com a equipe.'},
];

const quizQuestions = [
  {title:'O que você gostaria de conversar?',subtitle:'Seu principal interesse neste momento', options:['Saúde e prevenção', 'Textura e qualidade da pele', 'Expressão e naturalidade', 'Cabelo e couro cabeludo']},
  {title:'Qual região desperta seu interesse?',subtitle:'Escolha uma área para começar',options:['Rosto', 'Olhos e expressão', 'Pescoço', 'Couro cabeludo']},
  {title:'Como é sua rotina de cuidados?',subtitle:'Não existe resposta certa ou errada',options:['Estou começando', 'Tenho uma rotina simples', 'Já sigo orientações dermatológicas', 'Quero rever meus cuidados']},
  {title:'Como prefere começar?',subtitle:'O cuidado pode respeitar o seu tempo',options:['Entender o diagnóstico primeiro', 'Explorar cuidados mais leves', 'Conhecer opções e tecnologias', 'Deixar a médica orientar']},
  {title:'Quando pensa em agendar?',subtitle:'É apenas uma preferência',options:['O quanto antes', 'Nas próximas semanas', 'No próximo mês', 'Ainda estou conhecendo']},
];

function Brand({ light = false }: { light?: boolean }) {
  return <a href="#inicio" className={`brand ${light ? 'brand-light' : ''}`} aria-label="Regazzi Dermatologia, voltar ao início">
    <span className="brand-symbol" aria-hidden="true"><span /> <span /></span>
    <span className="brand-text"><strong>REGAZZI</strong><small>DERMATOLOGIA</small></span>
  </a>;
}
function WhatsAppIcon({size=22}:{size?:number}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20.3 11.65a8.3 8.3 0 0 1-12.13 7.37L3.1 20.4l1.4-4.91a8.3 8.3 0 1 1 15.8-3.84Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="M8.6 8.3c-.5-.22-.85.05-1.12.47-.47.74-.3 1.54.2 2.55a9.6 9.6 0 0 0 4.25 4.1 4.1 0 0 0 2.5.48c.6-.1 1.36-.7 1.47-1.27.1-.46-.1-.64-.51-.83l-1.5-.72c-.33-.15-.49-.1-.7.15l-.67.81c-.14.18-.29.2-.57.07a7.02 7.02 0 0 1-2.75-2.42c-.19-.27.07-.35.21-.58.12-.19.17-.33.25-.52.1-.22.05-.41-.06-.61L8.6 8.3Z" fill="currentColor"/></svg>;
}
function CtaLink({children, message=agendaText, light=false}: {children:ReactNode;message?:string;light?:boolean}) {
  return <a className={`pill-cta ${light ? 'pill-cta-light' : ''}`} href={waLink(message)} target="_blank" rel="noopener noreferrer">{children}<span className="cta-icon"><ArrowUpRight size={17}/></span></a>;
}
function Eyebrow({children, inverted=false}:{children:ReactNode;inverted?:boolean}) {return <div className={`eyebrow ${inverted?'eyebrow-inverted':''}`}><span className="eyebrow-dot"/>{children}</div>;}
function Reveal({children,className='',delay=0}:{children:ReactNode;className?:string;delay?:number}) {return <div className={`reveal ${className}`} data-delay={delay}>{children}</div>;}

function IntroLoader() {
  const [shown,setShown]=useState(true);
  useEffect(()=>{
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){setShown(false);return;}
    const timer=window.setTimeout(()=>setShown(false),1550);return ()=>window.clearTimeout(timer);
  },[]);
  return <AnimatePresence>{shown&&<motion.div className="intro-loader" exit={{opacity:0,transition:{duration:.64}}}>
    <motion.div className="loader-orb" initial={{scale:.35,opacity:0}} animate={{scale:[.35,1.1,1],opacity:[0,1,1]}} transition={{duration:1.2,ease:'easeOut'}} />
    <motion.span initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:.35,duration:.7}} className="loader-word">REGAZZI</motion.span>
    <span className="loader-sub">DERMATOLOGIA</span>
  </motion.div>}</AnimatePresence>;
}

function Header() {
  const [open,setOpen]=useState(false),[scrolled,setScrolled]=useState(false);
  useEffect(()=>{
    const fn=()=>setScrolled(window.scrollY>35);fn();window.addEventListener('scroll',fn,{passive:true});return ()=>window.removeEventListener('scroll',fn);
  },[]);
  useEffect(()=>{if(open){const e=(ev:KeyboardEvent)=>{if(ev.key==='Escape')setOpen(false);};window.addEventListener('keydown',e);return()=>window.removeEventListener('keydown',e);}},[open]);
  return <header className={`site-header ${scrolled?'header-scrolled':''}`}>
    <div className="header-inner layout"><Brand/><nav className="desktop-nav" aria-label="Navegação principal"><a href="#filosofia">Essência</a><a href="#tratamentos">Tratamentos</a><a href="#mapa">Mapa facial</a><a href="#equipe">As médicas</a></nav>
      <div className="header-actions"><a className="header-contact" href={waLink(agendaText)} target="_blank" rel="noopener noreferrer">Agendar consulta <ArrowUpRight size={16}/></a><button className="mobile-menu-toggle" aria-label={open?'Fechar menu':'Abrir menu'} aria-expanded={open} onClick={()=>setOpen(!open)}>{open?<X size={23}/>:<Menu size={23}/>}</button></div>
    </div>
    <AnimatePresence>{open&&<motion.nav className="mobile-nav" initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}} aria-label="Navegação mobile">{[['Essência','#filosofia'],['Tratamentos','#tratamentos'],['Mapa facial','#mapa'],['Tecnologias','#tecnologias'],['As médicas','#equipe'],['Dúvidas','#duvidas'],['Contato','#contato']].map(([name,to])=><a key={to} href={to} onClick={()=>setOpen(false)}>{name}<ArrowUpRight size={17}/></a>)}</motion.nav>}</AnimatePresence>
  </header>;
}

function Hero(){
  const setPointer=useExperience(s=>s.setPointer);
  return <section className="hero" id="inicio" data-scene="hero" onPointerMove={(e)=>{const r=e.currentTarget.getBoundingClientRect();setPointer([((e.clientX-r.left)/r.width-.5)*2,((r.height-(e.clientY-r.top))/r.height-.5)*2]);}}>
    <div className="hero-ambient hero-ambient-a"/><div className="hero-ambient hero-ambient-b"/>
    <div className="hero-grid layout">
      <div className="hero-copy">
        <div className="hero-topline"><span className="hero-topline-line"/> Dermatologia com ciência e sensibilidade</div>
        <h1>O cuidado que<br/>revela a sua<br/><em>essência.</em></h1>
        <p>Na Regazzi Dermatologia, ciência, naturalidade e escuta se encontram para cuidar de você — no seu tempo.</p>
        <div className="hero-buttons"><CtaLink>Agendar minha consulta</CtaLink><a className="text-cta" href="#filosofia">Conheça nossa essência <ArrowDown size={17}/></a></div>
        <div className="hero-footnote"><span className="small-cross">✳</span><span>Paula &amp; Beatriz Regazzi<br/><strong>Dermatologia clínica, cirúrgica e estética</strong></span></div>
      </div>
      <div className="hero-art" aria-label="Retrato das médicas Paula e Beatriz Regazzi">
        <div className="hero-picture-border"><div className="hero-photo-inner"><img src="./media/paula-beatriz-regazzi.jpg" alt="Retrato das duas dermatologistas da Regazzi Dermatologia" fetchPriority="high"/></div></div>
        <div className="hero-floating-text">BELEZA É<br/><em>ser você.</em></div>
        <div className="hero-side-text">RIO DE JANEIRO · PENÍNSULA</div>
        <div className="hero-seal"><span>REG</span><span className="seal-line"/><span>AZZI</span></div>
      </div>
    </div>
    <div className="hero-bottom layout"><span>CONHEÇA UM NOVO OLHAR SOBRE O CUIDADO</span><a href="#filosofia" aria-label="Rolar para a próxima seção"><span className="hero-scroll-line"/><ArrowDown size={17}/></a><span>01 / REG</span></div>
  </section>;
}

function Philosophy(){return <section className="philosophy" id="filosofia">
  <div className="philosophy-top layout"><Eyebrow inverted>NOSSA ESSÊNCIA</Eyebrow><span className="tiny-note">A SUA PELE CONTA UMA HISTÓRIA.<br/>NÓS ESCUTAMOS.</span></div>
  <div className="layout philosophy-inner">
    <Reveal><h2>Não sobre mudar<br/>quem você é.<br/><em>Sobre cuidar</em><br/>de quem você sempre foi.</h2></Reveal>
    <Reveal className="philosophy-aside" delay={.18}><span className="decorative-star">✳</span><p>Acreditamos em uma dermatologia que combina conhecimento científico, atualização constante e um olhar genuinamente humano.</p><a className="inline-arrow" href="#equipe">Conheça nossas médicas <ArrowUpRight size={17}/></a></Reveal>
  </div>
  <div className="layout values-grid">
    {[{n:'01',title:'Ciência',text:'Conhecimento dermatológico para embasar decisões e acompanhar cada história.'},{n:'02',title:'Naturalidade',text:'Respeito à individualidade, às proporções e às escolhas de cada pessoa.'},{n:'03',title:'Acolhimento',text:'Escuta atenta e um atendimento pensado para tornar a conversa mais leve.'}].map(v=><article className="value-card reveal" key={v.n}><span className="value-number">{v.n} /</span><div className="value-sigil" aria-hidden="true"><span/><span/></div><h3>{v.title}</h3><p>{v.text}</p><ArrowUpRight size={19}/></article>)}
  </div>
</section>}

function TreatmentArt({type}:{type:string}) {return <div className={`treatment-art art-${type}`} aria-hidden="true"><div className="art-disc"/><div className="art-ring art-ring-1"/><div className="art-ring art-ring-2"/><div className="art-ring art-ring-3"/><div className="art-glint"/></div>;}
function Treatments(){
  const [filter,setFilter]=useState<Category>('Todos');
  const [active,setActive]=useState<Treatment|null>(null);
  const shown=treatments.filter(x=>filter==='Todos'||x.category===filter);
  useEffect(()=>{const fn=(e:KeyboardEvent)=>{if(e.key==='Escape')setActive(null);};window.addEventListener('keydown',fn);return()=>window.removeEventListener('keydown',fn);},[]);
  useEffect(()=>{document.body.style.overflow=active?'hidden':'';return()=>{document.body.style.overflow='';};},[active]);
  return <section id="tratamentos" className="treatments section-pad">
    <div className="layout"><div className="section-header"><div><Reveal><Eyebrow>DERMATOLOGIA EM TODAS AS FASES</Eyebrow><h2 className="section-heading">Cuidado que acompanha<br/><em>cada versão de você.</em></h2></Reveal></div><Reveal><p className="section-desc">Da prevenção à dermatologia estética, diferentes possibilidades. Sempre com avaliação e indicação individualizadas.</p></Reveal></div>
      <div className="filter-bar" role="group" aria-label="Filtrar tratamentos">{treatmentCategories.map(cat=><button key={cat} aria-pressed={filter===cat} className={`filter-chip ${filter===cat?'active':''}`} onClick={()=>setFilter(cat)}>{cat}</button>)}</div>
      <motion.div className="treatment-grid" layout>{shown.map((t,i)=><motion.button layout initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{delay:Math.min(i*.035,.2),duration:.4}} onClick={()=>setActive(t)} key={t.name} className="treatment-card">
        <div className="treatment-image"><TreatmentArt type={t.illustration}/><span className="treatment-index">{t.label} / 10</span><span className="treatment-arrow"><ArrowUpRight size={18}/></span></div>
        <div className="treatment-info"><span>{t.category}</span><h3>{t.name}</h3><p>{t.short}</p></div>
      </motion.button>)}</motion.div>
      <Reveal className="treatment-bottom"><p>Não sabe por onde começar? A consulta dermatológica é o primeiro passo.</p><CtaLink>Conversar com a equipe</CtaLink></Reveal>
    </div>
    <AnimatePresence>{active&&<motion.div className="modal-scrim" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onMouseDown={(e)=>{if(e.target===e.currentTarget)setActive(null)}}><motion.div className="treatment-modal" role="dialog" aria-modal="true" aria-labelledby="modal-name" initial={{opacity:0,y:40,scale:.96}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:25,scale:.98}} transition={{type:'spring',damping:26,stiffness:260}}><button className="modal-close" onClick={()=>setActive(null)} aria-label="Fechar detalhes"><X size={22}/></button><div className="modal-art"><TreatmentArt type={active.illustration}/></div><div className="modal-body"><Eyebrow>{active.category} · DERMATOLOGIA</Eyebrow><h2 id="modal-name">{active.name}</h2><p className="modal-lead">{active.short}</p><div className="modal-divider"/><h3>Sobre essa possibilidade</h3><p>{active.detail}</p><h3>O que saber antes?</h3><p>{active.assessment}</p><div className="medical-note"><ShieldCheck size={19}/><span>Informações educativas. Não substituem avaliação, diagnóstico ou indicação médica.</span></div><CtaLink message={`Olá! Conheci a Regazzi Dermatologia pelo site e gostaria de agendar uma avaliação para conversar sobre ${active.name.toLowerCase()}.`}>Agendar avaliação <ArrowUpRight size={15}/></CtaLink></div></motion.div></motion.div>}</AnimatePresence>
  </section>;
}

function FaceMap(){
  const selected=useExperience(s=>s.selectedZone);
  const setZone=useExperience(s=>s.setZone);
  const setRotation=useExperience(s=>s.setFaceRotation);
  const rotation=useExperience(s=>s.faceRotation);
  const active=zones.find(z=>z.id===selected)||zones[3];
  const dragging=useRef<{x:number;initial:number}|null>(null);
  return <section id="mapa" className="face-section" data-scene="face">
    <div className="layout face-layout"><div className="face-left">
      <Eyebrow inverted>EXPERIÊNCIA INTERATIVA 01</Eyebrow>
      <div className="face-visual" onPointerDown={(e)=>{dragging.current={x:e.clientX,initial:rotation};e.currentTarget.setPointerCapture(e.pointerId)}} onPointerMove={(e)=>{if(dragging.current)setRotation(dragging.current.initial+(e.clientX-dragging.current.x)/210)}} onPointerUp={()=>dragging.current=null} onPointerCancel={()=>dragging.current=null} role="img" aria-label="Rosto tridimensional estilizado, arraste para girar. Selecione uma região pela lista ao lado.">
        <div className="visual-corner top-left"/><div className="visual-corner bottom-right"/><span className="visual-label-left">MAPEAMENTO FACIAL</span><span className="visual-label-bottom"><MousePointer2 size={16}/> ARRASTE PARA EXPLORAR</span><span className="face-orbit face-orbit-one"/><span className="face-orbit face-orbit-two"/>
      </div>
    </div><div className="face-right"><Reveal><h2>Cada rosto,<br/><em>uma história.</em></h2><p className="face-intro">Explore as regiões do rosto e conheça assuntos que podem fazer parte da sua avaliação dermatológica.</p></Reveal>
      <div className="zone-grid" role="group" aria-label="Selecione uma região do rosto">{zones.map((z)=><button onClick={()=>setZone(z.id)} className={`zone-button ${selected===z.id?'chosen':''}`} aria-pressed={selected===z.id} key={z.id}>{z.title}<Plus size={14}/></button>)}</div>
      <AnimatePresence mode="wait"><motion.div className="zone-detail" key={active.id} initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:.29}}><div className="zone-detail-top"><span>REGIÃO SELECIONADA</span><span>✳</span></div><h3>{active.title}</h3><p>{active.detail}</p><span className="zone-examples">PARA CONVERSAR: {active.examples}</span><a className="zone-wa" href={waLink(`Olá! Gostaria de marcar uma avaliação dermatológica. Tenho interesse em conversar sobre a região: ${active.title}.`)} target="_blank" rel="noopener noreferrer">Agendar avaliação desta região <ArrowUpRight size={18}/></a></motion.div></AnimatePresence>
      <p className="map-disclaimer"><ShieldCheck size={15}/> Mapa ilustrativo e educativo. Não realiza diagnóstico nem determina tratamentos.</p>
    </div></div>
  </section>;
}

function Technologies(){
 const [index,setIndex]=useState(0);
 const slides=[{tag:'TECNOLOGIA 01',title:'LinearZ',subtitle:'Ultrassom microfocado',desc:'Tecnologia que pode integrar abordagens dermatológicas específicas quando indicada, com avaliação das características individuais.',art:'tech-linear'},{tag:'TECNOLOGIA 02',title:'Laser dermatológico',subtitle:'Precisão e cuidado',desc:'Diferentes recursos tecnológicos para condições selecionadas da pele, com parâmetros definidos por indicação médica.',art:'tech-laser'},{tag:'TECNOLOGIA 03',title:'Dermatoscopia digital',subtitle:'Olhar atento à pele',desc:'Um exame complementar importante no acompanhamento de lesões e na avaliação dermatológica, quando indicado.',art:'tech-scope'}];
 return <section id="tecnologias" className="technologies section-pad"><div className="layout"><div className="section-header"><Reveal><Eyebrow>CONHECIMENTO + TECNOLOGIA</Eyebrow><h2 className="section-heading">A ciência como aliada<br/><em>do cuidado.</em></h2></Reveal><span className="tech-counter">0{index+1} <i/> 0{slides.length}</span></div>
 <div className="technology-stage"><div className={`technology-visual ${slides[index].art}`}><div className="device-halo"/><div className="device-main"><div className="device-core"/><div className="device-inner"/><div className="device-spot"/></div><span className="tech-watermark">R.</span></div><div className="technology-copy"><div className="tech-index">{slides[index].tag}</div><AnimatePresence mode="wait"><motion.div key={index} initial={{opacity:0,x:22}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-16}} transition={{duration:.32}}><h3>{slides[index].title}</h3><span className="technology-subtitle">{slides[index].subtitle}</span><p>{slides[index].desc}</p></motion.div></AnimatePresence><div className="tech-arrows"><button onClick={()=>setIndex((index+slides.length-1)%slides.length)} aria-label="Tecnologia anterior"><ArrowLeft size={20}/></button><button onClick={()=>setIndex((index+1)%slides.length)} aria-label="Próxima tecnologia"><ArrowRight size={20}/></button></div></div></div>
 <p className="tech-footnote">Representação visual conceitual. Os equipamentos e procedimentos disponíveis devem ser confirmados com a clínica.</p>
 </div></section>;
}

function Journey(){
 const step=useExperience(s=>Math.min(3,Math.floor(s.journeyProgress*3.999)));
 const steps=[{n:'01',title:'A chegada',short:'Um espaço para se sentir acolhida.',desc:'O começo de uma conversa, sem pressa e sem fórmulas prontas.'},{n:'02',title:'A escuta',short:'Você, sua história, suas dúvidas.',desc:'Entender o que trouxe você até aqui é parte essencial de cuidar.'},{n:'03',title:'A avaliação',short:'Conhecimento aplicado à sua realidade.',desc:'O exame dermatológico orienta decisões, possibilidades e cuidados.'},{n:'04',title:'O acompanhamento',short:'Um cuidado que continua.',desc:'Orientações e acompanhamento individualizado conforme cada necessidade.'}];
 return <section id="jornada" className="journey-section" data-scene="journey"><div className="journey-pin"><div className="journey-backdrop"/><div className="layout journey-layout"><div className="journey-left"><Eyebrow inverted>UMA JORNADA DE CUIDADO</Eyebrow><h2>Do primeiro<br/>olá ao <em>cuidar.</em></h2><p>Uma experiência pensada para você estar presente em cada etapa.</p><div className="journey-dots">{steps.map((s,i)=><span key={s.n} className={step===i?'active':''}/>)}</div></div><div className="journey-right"><span className="journey-counter">{steps[step].n} / 04</span><AnimatePresence mode="wait"><motion.div key={step} initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}} transition={{duration:.35}}><span className="journey-small">ETAPA {steps[step].n}</span><h3>{steps[step].title}</h3><h4>{steps[step].short}</h4><p>{steps[step].desc}</p></motion.div></AnimatePresence><span className="journey-caption">DESLIZE PARA EXPLORAR <ArrowDown size={17}/></span></div></div><div className="journey-floor-mark"/></div></section>;
}

function Quiz(){
 const [step,setStep]=useState(0),[answers,setAnswers]=useState<string[]>([]);
 const setCareProgress=useExperience(s=>s.setCareProgress);
 const selected=answers[step];
 const final=step===5;
 const choose=(value:string)=>{setAnswers(prev=>{const next=[...prev];next[step]=value;return next;});setCareProgress((step+1)/5);};
 const next=()=>{if(selected)setStep(s=>Math.min(s+1,5));};
 const prev=()=>setStep(s=>Math.max(0,s-1));
 const suggestions=(()=>{
   const topics=['Consulta dermatológica para avaliação individual'];
   if(answers[0]?.includes('Textura')||answers[1]==='Rosto')topics.push('Cuidados com a qualidade da pele');
   if(answers[0]?.includes('Expressão')||answers[1]==='Olhos e expressão')topics.push('Expressão facial e naturalidade');
   if(answers[0]?.includes('Cabelo')||answers[1]==='Couro cabeludo')topics.push('Avaliação do couro cabeludo');
   if(answers[0]?.includes('prevenção'))topics.push('Prevenção, fotoproteção e dermatoscopia');
   if(topics.length<3)topics.push('Possibilidades de cuidado e acompanhamento');
   return topics.slice(0,3);
 })();
 const summary=['Olá! Fiz o roteiro inicial no site da Regazzi Dermatologia e gostaria de agendar uma avaliação.','',...quizQuestions.map((q,i)=>`${q.title} ${answers[i]||'Não informado'}`),'','Entendo que o roteiro é educativo e não substitui a consulta.'].join('\n');
 return <section id="quiz" className="quiz-section" data-scene="care"><div className="layout quiz-layout"><div className="quiz-content"><Eyebrow>EXPERIÊNCIA INTERATIVA 02</Eyebrow><h2>Seu cuidado.<br/><em>Seu tempo.</em></h2><p className="quiz-lead">Cinco perguntas para ajudar a organizar seus interesses antes de conversar com uma dermatologista.</p>
   <div className="quiz-window"><div className="quiz-window-header"><span>{final?'UM PONTO DE PARTIDA':`PASSO 0${step+1} DE 05`}</span><div className="quiz-progress">{Array.from({length:5},(_,i)=><span key={i} className={i<step?'done':i===step?'now':''}/>)}</div></div>
     <AnimatePresence mode="wait"><motion.div key={step} initial={{opacity:0,x:24}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} transition={{duration:.25}}>
       {!final?<><h3>{quizQuestions[step].title}</h3><p className="quiz-question-sub">{quizQuestions[step].subtitle}</p><div className="quiz-options">{quizQuestions[step].options.map(option=><button key={option} className={`quiz-option ${selected===option?'selected':''}`} aria-pressed={selected===option} onClick={()=>choose(option)}><span>{option}</span><span className="quiz-option-check">{selected===option?<Check size={17}/>:<Plus size={16}/>}</span></button>)}</div></>:
       <><div className="quiz-result-icon"><CircleCheck size={26}/></div><h3>Vamos conversar sobre você?</h3><p className="quiz-question-sub">Esses são apenas temas para levar à consulta, baseados em suas escolhas — não são indicações de tratamento.</p><div className="quiz-result-topics">{suggestions.map((x,i)=><div key={x}><span>0{i+1}</span>{x}</div>)}</div><p className="quiz-warning">Diagnóstico, contraindicações e indicação de procedimentos são decisões exclusivas da profissional responsável durante a consulta.</p><a href={waLink(summary)} target="_blank" rel="noopener noreferrer" className="quiz-send"><WhatsAppIcon size={19}/> Enviar minhas preferências pelo WhatsApp <ArrowUpRight size={17}/></a></>}
     </motion.div></AnimatePresence>
     <div className="quiz-bottom">{!final?<><button disabled={step===0} className="quiz-back" onClick={prev}><ChevronLeft size={17}/> Voltar</button><button className="quiz-next" disabled={!selected} onClick={next}>{step===4?'Ver meu resumo':'Continuar'}<ArrowRight size={18}/></button></>:<button className="quiz-back" onClick={()=>{setStep(0);setAnswers([]);setCareProgress(0)}}><ArrowLeft size={16}/> Refazer roteiro</button>}</div>
   </div>
 </div><div className="quiz-art"><span>UM CUIDADO QUE SE TRANSFORMA</span><div className="quiz-orbit orbit-1"/><div className="quiz-orbit orbit-2"/><div className="quiz-orbit orbit-3"/><span className="quiz-art-bottom">O INÍCIO DE UMA CONVERSA.</span></div></div></section>;
}

function Team(){return <section id="equipe" className="team-section section-pad"><div className="layout"><div className="team-top"><Eyebrow>QUEM CUIDA DE VOCÊ</Eyebrow><h2>Ciência no olhar.<br/><em>Cuidado no encontro.</em></h2></div><div className="team-main"><div className="team-photo-frame reveal"><img loading="lazy" src="./media/paula-beatriz-regazzi.jpg" alt="Fotografia das dermatologistas Paula e Beatriz Regazzi juntas"/><span className="team-photo-caption">PAULA &amp; BEATRIZ REGAZZI</span></div><div className="team-copy"><Reveal><span className="team-mini">DUAS TRAJETÓRIAS, UMA MESMA ESSÊNCIA.</span><p className="team-opening">A dermatologia que acreditamos começa com <em>escuta</em>, passa pelo conhecimento e respeita a sua individualidade.</p></Reveal><div className="doctor-list"><article className="doctor-item reveal"><span>01</span><div><h3>Dra. Paula Regazzi de Gusmão</h3><p>Dermatologista. Especialista pelo Instituto Prof. Rubem David Azulay e preceptora do setor de laser da Santa Casa do Rio de Janeiro.</p><small>CRM-RJ 52-96455-7 · RQE 26749</small></div></article><article className="doctor-item reveal"><span>02</span><div><h3>Dra. Beatriz Regazzi</h3><p>Dermatologista formada pela UFRJ, especialista pelo Instituto Prof. Rubem David Azulay.</p><small>CRM-RJ 52-109737-7 · RQE 40045</small></div></article></div><a href={waLink(agendaText)} target="_blank" rel="noopener noreferrer" className="underlined-link">Marcar uma consulta com a equipe <ArrowUpRight size={19}/></a></div></div></div></section>}

function Tips(){return <section className="tips-section section-pad"><div className="layout"><div className="tips-header"><Eyebrow>PEQUENOS GESTOS, GRANDES CUIDADOS</Eyebrow><h2>Conhecimento também<br/>é uma forma de <em>cuidar.</em></h2></div><div className="tips-grid">{[
  {n:'01',tag:'FOTOPROTEÇÃO',title:'Proteger a pele é um cuidado de todos os dias.',body:'A escolha do fotoprotetor e a forma de uso devem considerar sua rotina e a orientação dermatológica.',art:'sun'},
  {n:'02',tag:'AUTOCONHECIMENTO',title:'Observe as mudanças na sua pele.',body:'Novas lesões ou mudanças em pintas merecem avaliação dermatológica. O acompanhamento é individual.',art:'skin'},
  {n:'03',tag:'ROTINA',title:'O essencial não precisa ser complicado.',body:'Uma boa rotina começa com a compreensão das necessidades da sua pele — não com excesso de produtos.',art:'routine'},
  ].map(t=><article key={t.n} className={`tip-card tip-${t.art} reveal`}><div className="tip-illustration"><span>{t.n}</span><div className="tip-shape"/></div><div className="tip-info"><span>{t.tag}</span><h3>{t.title}</h3><p>{t.body}</p></div></article>)}</div></div></section>}

function FAQ(){const [active,setActive]=useState<number|null>(0);return <section id="duvidas" className="faq-section section-pad"><div className="layout faq-layout"><div><Reveal><Eyebrow>DÚVIDAS FREQUENTES</Eyebrow><h2 className="section-heading">Toda pergunta<br/>merece <em>atenção.</em></h2><p className="faq-side">Se ainda tiver alguma dúvida, nossa equipe está disponível no WhatsApp.</p><CtaLink>Falar com a equipe</CtaLink></Reveal></div><div className="faq-items">{faqs.map((f,i)=><div key={f.question} className={`faq-item ${active===i?'open':''}`}><button onClick={()=>setActive(active===i?null:i)} aria-expanded={active===i}><span className="faq-index">0{i+1}</span><span>{f.question}</span><ChevronDown size={19}/></button><AnimatePresence initial={false}>{active===i&&<motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} transition={{duration:.28}} className="faq-answer"><p>{f.answer}</p></motion.div>}</AnimatePresence></div>)}</div></div></section>}

function Contact(){
 const [name,setName]=useState(''),[topic,setTopic]=useState('Consulta dermatológica'),[when,setWhen]=useState('Gostaria de consultar a disponibilidade');
 const [phase,setPhase]=useState(0);
 const submit=()=>{const msg=`Olá! Gostaria de agendar uma consulta na Regazzi Dermatologia.\nNome: ${name.trim()||'Não informado'}\nInteresse: ${topic}\nPreferência: ${when}`;window.open(waLink(msg),'_blank','noopener,noreferrer');};
 return <section className="contact-section" id="contato"><div className="contact-lines"/><div className="layout contact-grid"><div className="contact-copy"><Eyebrow inverted>O PRÓXIMO PASSO</Eyebrow><h2>Vamos cuidar<br/>de você?</h2><p>O primeiro passo pode ser uma conversa. Estamos aqui para ajudar você a agendar sua consulta.</p><a className="contact-phone" href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer"><WhatsAppIcon size={24}/> (21) 96781-1873 <ArrowUpRight size={19}/></a></div><div className="contact-form"><div className="contact-form-top"><span>AGENDAMENTO</span><span>0{phase+1} / 02</span></div><h3>{phase===0?'Como podemos chamar você?':'Como podemos ajudar?'}</h3><AnimatePresence mode="wait"><motion.div key={phase} initial={{opacity:0,x:15}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-15}}>{phase===0?<><label htmlFor="name">SEU NOME</label><input id="name" value={name} maxLength={75} onChange={e=>setName(e.target.value)} placeholder="Digite seu nome"/><label htmlFor="topic">QUAL O MOTIVO DO CONTATO?</label><select id="topic" value={topic} onChange={e=>setTopic(e.target.value)}><option>Consulta dermatológica</option><option>Avaliação dermatológica estética</option><option>Avaliação de pele e manchas</option><option>Queda capilar</option><option>Dermatoscopia e prevenção</option><option>Outras dúvidas</option></select></>:<><label htmlFor="when">QUANDO GOSTARIA DE CONVERSAR?</label><select id="when" value={when} onChange={e=>setWhen(e.target.value)}><option>Gostaria de consultar a disponibilidade</option><option>O quanto antes</option><option>Nas próximas semanas</option><option>No próximo mês</option></select><div className="contact-review"><CircleCheck size={20}/><span>Seu pedido será aberto no WhatsApp para você conferir antes de enviar. O site não transmite estes dados a um servidor próprio.</span></div></>}</motion.div></AnimatePresence><div className="contact-form-bottom">{phase===1&&<button className="contact-previous" onClick={()=>setPhase(0)}><ChevronLeft size={16}/> Voltar</button>}<button className="contact-submit" onClick={phase===0?()=>{if(name.trim())setPhase(1);}:submit} disabled={phase===0&&!name.trim()}>{phase===0?'Continuar':'Abrir WhatsApp'}{phase===0?<ArrowRight size={19}/>:<Send size={17}/>}</button></div></div></div>
  <div className="layout contact-location"><div><MapPin size={20}/><div><span>ONDE ESTAMOS</span><p>Av. João Cabral de Mello Neto, 850<br/>Bloco 2, sala 816 · Península · Barra da Tijuca<br/>Rio de Janeiro, RJ</p><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADDRESS)}`} target="_blank" rel="noopener noreferrer">Ver no Google Maps <ArrowUpRight size={15}/></a></div></div><div><Clock3 size={20}/><div><span>HORÁRIO DE ATENDIMENTO</span><p>Segunda a sexta-feira<br/>Das 9h às 18h</p><small>Sábado e domingo: fechado</small></div></div><div><CalendarDays size={20}/><div><span>FALE COM A EQUIPE</span><p>Estamos disponíveis para orientar<br/>sobre agendamento e dúvidas.</p><a href={waLink(agendaText)} target="_blank" rel="noopener noreferrer">Conversar no WhatsApp <ArrowUpRight size={15}/></a></div></div></div>
 </section>;
}
function Footer(){return <footer className="site-footer"><div className="layout footer-top"><div><Brand light/><p>Ciência, naturalidade e acolhimento.<br/>Dermatologia na Península, Barra da Tijuca.</p></div><div className="footer-links"><div><strong>EXPLORAR</strong><a href="#filosofia">Nossa essência</a><a href="#tratamentos">Tratamentos</a><a href="#mapa">Mapa facial</a><a href="#equipe">As médicas</a></div><div><strong>CONECTAR</strong><a href={INSTAGRAM} target="_blank" rel="noopener noreferrer">Instagram <ArrowUpRight size={13}/></a><a href={waLink(agendaText)} target="_blank" rel="noopener noreferrer">WhatsApp <ArrowUpRight size={13}/></a><a href="#contato">Localização</a></div></div></div><div className="layout footer-bottom"><span>© {new Date().getFullYear()} REGAZZI DERMATOLOGIA</span><span>RESPONSÁVEIS MÉDICAS: DRA. PAULA REGAZZI · CRM-RJ 52-96455-7 / RQE 26749 | DRA. BEATRIZ REGAZZI · CRM-RJ 52-109737-7 / RQE 40045</span><a href="#privacidade">PRIVACIDADE <ArrowUpRight size={12}/></a></div><div id="privacidade" className="layout privacy-line">Este site não recebe uploads de fotografias e não oferece diagnóstico. As preferências de agendamento são preenchidas localmente e encaminhadas somente quando você decide abrir o WhatsApp. Para esclarecimentos sobre dados e direitos LGPD, contate a clínica pelos canais oficiais.</div></footer>}

function FloatingWhatsApp(){return <a className="floating-whatsapp" href={waLink(agendaText)} target="_blank" rel="noopener noreferrer" aria-label="Agendar consulta pelo WhatsApp"><WhatsAppIcon size={27}/><span className="floating-tooltip">Agende sua consulta</span></a>}

function ScrollProgress(){const [percent,setPercent]=useState(0);useEffect(()=>{const fn=()=>{const total=document.documentElement.scrollHeight-window.innerHeight;setPercent(total?window.scrollY/total*100:0);};window.addEventListener('scroll',fn,{passive:true});return()=>window.removeEventListener('scroll',fn);},[]);return <div className="scroll-progress" style={{width:`${percent}%`}}/>;}

function usePageMotion(){
 const setScene=useExperience(s=>s.setScene),setJourney=useExperience(s=>s.setJourneyProgress),setHeroMorph=useExperience(s=>s.setHeroMorph);
 useEffect(()=>{
   const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
   const sceneEls=[...document.querySelectorAll<HTMLElement>('[data-scene]')];
   let frame=0;
   const detect=()=>{if(frame)return;frame=requestAnimationFrame(()=>{frame=0;const midpoint=window.innerHeight*.43;let found:'none'|'hero'|'face'|'care'|'journey'='none';for(const el of sceneEls){const r=el.getBoundingClientRect();if(r.top<=midpoint&&r.bottom>=midpoint){const id=el.dataset.scene; if(id==='hero'||id==='face'||id==='care'||id==='journey')found=id;}}
   setScene(found);});};
   detect();window.addEventListener('scroll',detect,{passive:true});window.addEventListener('resize',detect);
   if(reduced){document.querySelectorAll<HTMLElement>('.reveal').forEach(el=>{el.style.opacity='1';el.style.transform='none';});return()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',detect);window.removeEventListener('resize',detect)}}
   const lenis=new Lenis({duration:1.08,smoothWheel:true,anchors:true});
   lenis.on('scroll',ScrollTrigger.update);
   const tick=(time:number)=>lenis.raf(time*1000);
   gsap.ticker.add(tick);gsap.ticker.lagSmoothing(0);
   const triggers:ScrollTrigger[]=[];
   const animations:gsap.core.Tween[]=[];
   document.querySelectorAll<HTMLElement>('.reveal').forEach(el=>{
     const tween=gsap.fromTo(el,{opacity:0,y:49},{opacity:1,y:0,duration:.95,delay:Number(el.dataset.delay||0),ease:'power3.out',scrollTrigger:{trigger:el,start:'top 90%',once:true}});
     animations.push(tween);
   });
   const heroImg=document.querySelector('.hero-photo-inner img');
   if(heroImg)animations.push(gsap.to(heroImg,{y:-65,scale:1.08,ease:'none',scrollTrigger:{trigger:'#inicio',start:'top top',end:'bottom top',scrub:true}}));
   const morphTrigger=ScrollTrigger.create({trigger:'#inicio',start:'top top',end:'bottom top',onUpdate:self=>setHeroMorph(Math.min(1,Math.max(0,(self.progress-.15)/.7)))});triggers.push(morphTrigger);
   const journeyEl=document.querySelector<HTMLElement>('.journey-pin');
   if(journeyEl){const st=ScrollTrigger.create({trigger:'.journey-section',start:'top top',end:'+=2600',pin:journeyEl,scrub:true,anticipatePin:1,onUpdate:self=>setJourney(self.progress),onEnter:()=>setScene('journey'),onEnterBack:()=>setScene('journey')});triggers.push(st);}
   ScrollTrigger.refresh();
   return()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',detect);window.removeEventListener('resize',detect);gsap.ticker.remove(tick);lenis.destroy();animations.forEach(a=>{a.scrollTrigger?.kill();a.kill()});triggers.forEach(t=>t.kill());};
 },[setScene,setJourney,setHeroMorph]);
}

export default function App(){usePageMotion();return <><ScrollProgress/><IntroLoader/><Header/><main><Hero/><Philosophy/><Treatments/><FaceMap/><Technologies/><Journey/><Quiz/><Team/><Tips/><FAQ/><Contact/></main><Footer/><Scene3D/><FloatingWhatsApp/></>}
