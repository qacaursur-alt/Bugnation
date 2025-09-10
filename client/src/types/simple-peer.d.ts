declare module 'simple-peer' {
  interface Instance {
    on(event: string, callback: (data?: any) => void): void;
    send(data: any): void;
    signal(data: any): void;
    destroy(): void;
  }
  
  interface Options {
    initiator?: boolean;
    trickle?: boolean;
    stream?: MediaStream;
  }
  
  class SimplePeer {
    constructor(options?: Options);
    on(event: string, callback: (data?: any) => void): void;
    send(data: any): void;
    signal(data: any): void;
    destroy(): void;
  }
  
  export = SimplePeer;
}
