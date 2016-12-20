import _ from 'lodash'

const img_ext_regex = /(\.png|\.jpg|\.jpeg|\.gif|\.tiff|\.tif)$/i
const convertImgToText = (p) => {
  let pictList = $(p).find('[r\\:embed], img')
  _.forEach(pictList, (pict, i) => {
    let src = $(pict).attr('src')
    if (img_ext_regex.test(src)) {
      src = src.split('/').slice(1).join('/')
      return $(`<span>![img]{"${src}"}</span>`).insertBefore(pict);
    }
  })
  return p.textContent
}

const getTextContent = (batch) => {
  let text = ''
  _.forEach(batch, (p, i) => {
    let textContent
    if ($(p).is('p')) {
      textContent = convertImgToText(p)
    } else {
      textContent = ''
    }
    return text += textContent + '\n'
  })
  return text.trim()
};

const getByRange = function(batch, start, end, filter) {
  var retBatch;
  retBatch = [];
  if (!_.isFinite(start)) {
    return retBatch;
  }
  if (_.isUndefined(end)) {
    end = batch.length - 1;
  }
  if (_.isFunction(end)) {
    filter = end;
    end = batch.length - 1;
  }
  if (_.isUndefined(filter) || !_.isFunction(filter)) {
    filter = function() {
      return true;
    };
  }
  _.forEach(batch, function(v, i) {
    if (i >= start && i <= end && filter(v, i)) {
      return retBatch.push(v);
    }
  });
  return retBatch;
};

const _hasChoices = (batch) => {
  var _1stNodeIndex, matchResult;
  _1stNodeIndex = -1;
  matchResult = _.reduce(batch, (result, p, i) => {
    var match;
    match = p.textContent.trim().match(/^A|\b[BCD](?=[\.、])/g) || [];
    if (match[0] === 'A') {
      _1stNodeIndex = i;
    }
    return result.concat(match);
  }, []);
  if (_.isEqual(matchResult, ['A', 'B', 'C', 'D']) || _.isEqual(matchResult, ['A', 'C', 'B', 'D'])) {
    return _1stNodeIndex;
  }
  return -1;
}

const getQuestions = function(lines) {
  /*
  对 questions 的 parse，根据【label】切分题目
   */
  var batch, bodyBatch, choicesBatch, choicesIndex, difficultyText, i, isFirstLabel, isLastLabel, j, labelList, nextLabel, questionList, questionObj, ref, urlText;
  questionList = [];
  labelList = [];

  _.forEach(lines, function(p, i) {
    var label, pText;
    pText = p.textContent.trim();
    if (/^【.+】/.test(pText)) {
      label = {};
      label.index = i;
      label.node = p;
      label.type = pText.slice(pText.indexOf('【') + 1, pText.indexOf('】')).trim();
      return labelList.push(label);
    }
  });
  for (let i = 0, ref = labelList.length; i < ref; i++) {
    let thisLabel, nextLabel, batch, isFirstLabel
    let isLastLabel = false

    if (i === labelList.length - 1) {
      isLastLabel = true
      thisLabel = labelList[i]
      batch = getByRange(lines, thisLabel.index)
    } else {
      thisLabel = labelList[i]
      nextLabel = labelList[i + 1]
      batch = getByRange(lines, thisLabel.index, nextLabel.index - 1)
    }

    if (thisLabel.type === '题目编号') {
      if (questionObj) {
        questionList.push(questionObj)
      }
      questionObj = {}
      questionObj.id = getTextContent(batch).replace('【题目编号】', '')
    } else

    if (thisLabel.type === '题干') {
      choicesIndex = -1 // _hasChoices(batch)
      // bodyBatch = choicesIndex > 0 ? getByRange(batch, 0, choicesIndex - 1) : batch
      // choicesBatch = choicesIndex > 0 ? getByRange(batch, choicesIndex) : void 0
      questionObj.content = getTextContent(batch).replace('【题干】', '')
      // if (choicesBatch) {
      //   questionObj.choices = getTextContent(choicesBatch).replace(/(\s+)([ABCD])(?=[\.、])/g, '\n$2')
      // }
    } else

    if (thisLabel.type === '题型') {
      questionObj.type = getTextContent(batch).replace('【题型】', '')
    } else

    if (thisLabel.type === '答案') {
      questionObj.answer = getTextContent(batch).replace('【答案】', '')
    } else

    if (thisLabel.type === '分析') {
      if (!questionObj.analyze) questionObj.analyze = []
      let analyzeObj = questionObj.analyze.pop() || {}
      questionObj.analyze.push(analyzeObj)
      analyzeObj.analysis = getTextContent(batch).replace('【分析】', '')
    } else

    if (thisLabel.type === '解析') {
      if (!questionObj.analyze) questionObj.analyze = []
      let analyzeObj = questionObj.analyze.pop() || {}
      questionObj.analyze.push(analyzeObj)
      analyzeObj.analyze_content = []
    } else

    if (/^第.+步$/.test(thisLabel.type)) {
      let analyzeObj = questionObj.analyze[questionObj.analyze.length - 1]
      analyzeObj.analyze_content.push(
        getTextContent(batch).replace(/【第[^】]+步】/, '')
      )
    } else

    if (thisLabel.type === '选项') {
      questionObj.option = ''
      questionObj.option += getTextContent(batch).replace('【选项】', '')
    } else

    if (/^[a-z]$/i.test(thisLabel.type)) {
      // here goes a shameless hack, so the client change their mind
      // and requires no more options splitting, here I simply merge their text together
      questionObj.option += getTextContent(batch)
    } else

    if (thisLabel.type === '主知识点编号') {
      questionObj.knowledge_1 = getTextContent(batch).replace('【主知识点编号】', '')
    } else

    if (thisLabel.type === '副知识点编号') {
      questionObj.knowledge_2 = getTextContent(batch).replace('【副知识点编号】', '')
    } else

    if (thisLabel.type === '难度') {
      difficultyText = getTextContent(batch)
      questionObj.difficulty = (difficultyText.match(/\*/g) || []).length
    } else

    if (thisLabel.type === '预计时间') {
      questionObj.estimates_time = getTextContent(batch).replace('【预计时间】', '')
    } else

    if (thisLabel.type === '能力维度') {
      questionObj.capacity_dimension = getTextContent(batch).replace('【能力维度】', '')
    } else

    if (thisLabel.type === '地区') {
      var area = getTextContent(batch).replace('【地区】', '')
      area = area.split('\n')[0]
      questionObj.area = area
    }

    if (isLastLabel) questionList.push(questionObj)
  }
  return questionList
};


export default {
  parse: function (rawText) {
    const mainDocument = $.parseHTML(rawText)
    const lines = $(mainDocument).children()
    return getQuestions(lines)
  }
}
